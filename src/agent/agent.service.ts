import {ConflictException, Injectable, UnauthorizedException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {AgentRepository} from "./agent.repository";
import {Agent} from "./agent.entity";
import {StudentRepository} from "../student/student.repository";
import {TxnRepository} from "./txn.repository";
import {DepositDto} from "./dto/deposit.dto";
import {WithdrawDto} from "./dto/withdraw.dto";
import {Student} from "../student/student.entity";
import {Connection} from "typeorm/index";
import {User} from "../auth/user.entity";

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

    getUnactivatedStudents(agent: Agent) {
        return this.studentRepository.getUnActivatedStudents(agent.id);
    }

    getActivatedStudents(agent: Agent) {
        return this.studentRepository.getActivatedStudents(agent.id);
    }

    async getPaidStudents(agent: User, downlineUsername: string) {
        let downline;
        if (!downlineUsername || downlineUsername === agent.username) {
            downline = agent;
        } else downline = await this.agentRepository.getUserIfDownline(agent, downlineUsername);
        if (downline) {
            return this.studentRepository.getPaidStudents(downline.id);
        } else throw new UnauthorizedException("Network not Accessible");
    }

    withdraw(agent: User, withdrawDto: WithdrawDto) {
        if (agent.agent.balance == 0 || agent.agent.balance < withdrawDto.amount) throw new ConflictException("Insufficient Wallet Balance");
        return this.txnRepository.withdraw(agent, withdrawDto.amount, withdrawDto.upi_id, withdrawDto.remark);
    }

    deposit(agent: Agent, depositDto: DepositDto) {
        return this.txnRepository.deposit(agent, depositDto.amount, depositDto.txn_time, depositDto.txn_code, depositDto.remark);
    }

    getSubOrdinateAgents(agent: User, downlineUsername: string) {
        return this.agentRepository.getSubOrdinateAgents(agent, downlineUsername);
    }

    async activateStudents(agent: Agent, usernameString: string) {
        const usernames = usernameString.split(",");
        const cost = usernames.length * 360;
        if (cost > agent.balance) throw new ConflictException("Insufficient Wallet Balance");
        return await this.connection.transaction(async manager => {
            const studentRepository = manager.getRepository<Student>("student");
            const agentRepository = manager.getRepository<Agent>("agent");

            await studentRepository.createQueryBuilder()
                .update(Student)
                .set({paid_at: new Date()})
                .where("student.username IN (:...usernames)", {usernames: usernames})
                .execute();
            await agentRepository.createQueryBuilder()
                .update(Agent)
                .set({balance: () => `balance - ${cost}`})
                .execute();
        });
    }

    getTxns(agent: Agent) {
        return this.txnRepository.getTxns(agent);
    }
}
