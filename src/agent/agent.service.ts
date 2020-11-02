import {BadRequestException, ConflictException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {AgentRepository} from "./agent.repository";
import {Agent} from "./agent.entity";
import {StudentRepository} from "../student/student.repository";
import {TxnRepository} from "./txn.repository";
import {WithdrawDto} from "./dto/withdraw.dto";
import {Student} from "../student/student.entity";
import {Connection, In, IsNull, Like, Not} from "typeorm/index";
import {User} from "../auth/user.entity";
import {UserType} from "../auth/jwt-payload.interface";
import {Transaction} from "./txn.entity";
import {TxnStatus} from "./txn.status";
import * as Razorpay from "razorpay";
import * as config from 'config';
import * as crypto from "crypto";

const RazorpayConfig = config.get('razorpay');

@Injectable()
export class AgentService {
    constructor(
        @InjectRepository(AgentRepository)
        private agentRepository: AgentRepository,
        private studentRepository: StudentRepository,
        private txnRepository: TxnRepository,
        private connection: Connection
    ) {
    }

    async getDetails(user: User) {
        const team_size = await Agent.createQueryBuilder("agent").where({
            ancestry: Like(`%/${user.id}/%`)
        }).getCount()
        const student_count = await Student.createQueryBuilder("student").where({
            ancestry: Like(`%/${user.id}/%`),
            paid_at: Not(IsNull()),
        }).getCount()

        const r = user.toSignedInUser(UserType.Agent, !!user.agent)
        r.agent.paid_students = student_count
        r.agent.sub_agents = team_size
        return r;
    }

    getActivationRequests(user: User) {
        return this.studentRepository.getActivationRequests(user.agent.id);
    }

    async initializeDeposit(user: User, amount: number) {
        if(amount <= 0) throw new BadRequestException('Amount must be greater than zero!')
        const instance = new Razorpay({key_id: RazorpayConfig.keyId, key_secret: RazorpayConfig.keySecret});
        const options = {
            amount: amount * 100,
            currency: "INR"
        };
        const order = await instance.orders.create(options);
        const txn = new Transaction();
        txn.agent_id = user.agent.id;
        txn.amount = +amount;
        txn.txn_time = new Date().toDateString();
        txn.remark = `Deposit ${amount}`;
        txn.txn_status = TxnStatus.Processing;
        txn.txn_code = order.id;
        await txn.save();
        return order;
    }

    async verifyRazorpaySignature(payment_response) {
        const hmac = await crypto.createHmac('sha256', RazorpayConfig.keySecret);
        hmac.update(payment_response.order_id + "|" + payment_response.payment_id);
        const generatedSignature = await hmac.digest('hex');
        if (generatedSignature !== payment_response.signature) {
            throw new BadRequestException('Payment Verification Failed!')
        }
    }

    async onDepositSuccess(user: User, paymentResponse) {
        await this.verifyRazorpaySignature(paymentResponse);
        return await this.connection.transaction(async manager => {
            const agentRepository = manager.getRepository<Agent>("agent");
            const txnRepo = manager.getRepository<Transaction>("transaction");

            const txn = await txnRepo.findOne({
                where: {
                    txn_code: paymentResponse.order_id
                }
            });

            if (txn && (txn.txn_status === TxnStatus.Processing) && (user.agent.id === txn.agent_id)) {
                await agentRepository.createQueryBuilder()
                    .update(Agent)
                    .set({balance: () => `balance + ${txn.amount}`})
                    .where("id = :id", {id: user.agent.id})
                    .execute();
                txn.txn_status = TxnStatus.Successful;
                await txnRepo.save(txn);
            } else throw new ConflictException('Payment Verification Failed!');
        });
    }

    withdraw(agent: User, withdrawDto: WithdrawDto) {
        if (agent.agent.balance == 0 || agent.agent.balance < withdrawDto.amount) throw new ConflictException("Insufficient Wallet Balance");
        return this.txnRepository.withdraw(agent, withdrawDto.amount, withdrawDto.upi_id, withdrawDto.remark);
    }

    getSubOrdinateAgents(agent: User, downlineAgentId: number) {
        return this.agentRepository.getSubOrdinateAgents(agent, downlineAgentId);
    }

    async activateStudents(agent: User, idString: string) {
        const ids = idString.split(",");
        const cost = ids.length * 360;
        const commission = ids.length * 120;
        const diff = ids.length * 240;

        if (cost > agent.agent.balance) throw new ConflictException("Insufficient Mulya");

        const alreadyActivatedStudents = await Student.find({
            where: {
                id: In(ids),
                paid_at: Not(IsNull())
            }
        });
        if (alreadyActivatedStudents || alreadyActivatedStudents.length > 0) throw new ConflictException("Some students already activated!, Please refresh!");

        const costTxn = new Transaction();
        costTxn.agent_id = agent.agent.id;
        costTxn.amount = -cost;
        costTxn.txn_time = new Date().toDateString();
        costTxn.remark = `Activation of ${ids.length} student`;
        costTxn.txn_status = TxnStatus.Successful;
        costTxn.txn_code = `Activation of ${idString} student`;

        const commissionTxn = new Transaction();
        commissionTxn.agent_id = agent.agent.id;
        commissionTxn.amount = +commission;
        commissionTxn.txn_time = new Date().toDateString();
        commissionTxn.remark = `Commission - Activation of ${ids.length} student`;
        commissionTxn.txn_status = TxnStatus.Successful;
        commissionTxn.txn_code = `Commission - Activation of ${idString} student`;

        return await this.connection.transaction(async manager => {

            const studentRepository = manager.getRepository<Student>("student");
            const agentRepository = manager.getRepository<Agent>("agent");
            const txnRepo = manager.getRepository<Transaction>("transaction");

            await studentRepository.createQueryBuilder()
                .update(Student)
                .set({paid_at: new Date()})
                .where("student.id IN (:...ids)", {ids: ids})
                .execute();

            await agentRepository.createQueryBuilder()
                .update(Agent)
                .set({balance: () => `balance - ${diff}`})
                .where("id = :id", {id: agent.agent.id})
                .execute();

            await txnRepo.save([costTxn, commissionTxn])
        });
    }

    getTxns(agent: User) {
        return this.txnRepository.getTxns(agent);
    }
}
