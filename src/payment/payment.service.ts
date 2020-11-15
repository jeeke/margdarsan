import {BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger} from '@nestjs/common';
import {UnknownElementException} from "@nestjs/core/errors/exceptions/unknown-element.exception";
import {User} from "../entities/user.entity";
import {Transaction} from "../entities/txn.entity";
import {TxnStatus} from "../agent/txn.status";
import {Agent} from "../entities/agent.entity";
import {WithdrawDto} from "../agent/dto/withdraw.dto";
import * as Razorpay from "razorpay";
import * as config from 'config';
import * as crypto from "crypto";
import {TxnRepository} from "../agent/txn.repository";
import {Connection, In, IsNull} from "typeorm/index";
import {Student} from "../entities/student.entity";
import {StudentService} from "../student/student.service";
import {UserType} from "../auth/jwt-payload.interface";
const RazorpayConfig = config.get('razorpay');

@Injectable()
export class PaymentService {
    constructor(
        private connection: Connection,
        private txnRepository: TxnRepository,
        private studentService: StudentService
    ) {
    }

    private logger = new Logger("PaymentService");

    // ----------------------------Razorpay Webhook Events----------------------------

    async handlePaymentEvent(body,signature) {
        await Razorpay.validateWebhookSignature(JSON.stringify(body),signature, RazorpayConfig.webhookSecret)
        const payment = body.payload.payment.entity
        const txn = await Transaction.findOne({
            where: {
                order_id: payment.order_id
            },
            relations: ["user"]
        });
        if (!txn) throw new UnknownElementException('Transaction Not Found!')
        if (body.event === 'payment.captured') {
            await this.handlePaymentCapturedEvent(payment, txn);
        } else if (body.event === 'payment.failed') {
            await this.handlePaymentFailedEvent(payment, txn)
        } else {
            this.logger.error("Unknown Payment Event", JSON.stringify(body))
            throw new UnknownElementException("Unknown payment event!");
        }
    }

    async handlePaymentCapturedEvent(payment, txn: Transaction) {
        const {id, status, amount, captured} = payment
        if (txn.txn_status !== TxnStatus.Processing) return "Already Settled!";
        if (status === 'captured' && captured && txn.amount * 100 === amount) {
            txn.txn_status = TxnStatus.Successful
            txn.payment_id = id

            return await this.connection.transaction(async manager => {
                const studentRepository = manager.getRepository<Student>("student");
                const agentRepository = manager.getRepository<Agent>("agent");
                const txnRepo = manager.getRepository<Transaction>("transaction");

                if (txn.user.user_type === UserType.Student) {
                    txn.user.student.paid_at = new Date();
                    txn.user.student.activation_requested = false;
                    await studentRepository.save(txn.user.student);
                } else if (txn.user.user_type === UserType.Agent) {
                    await agentRepository.createQueryBuilder()
                        .update(Agent)
                        .set({balance: () => `balance + ${txn.amount}`})
                        .where("id = :id", {id: txn.user.agent.id})
                        .execute();
                }
                await txnRepo.save(txn);
            });
        } else throw new ConflictException('Payment tampered!');
    }

    async handlePaymentFailedEvent(payment, txn: Transaction) {
        const {status, error_description} = payment
        if (txn.txn_status !== TxnStatus.Processing) return "Already Settled!";
        if (status === "failed") {
            txn.txn_status = TxnStatus.Failed
            txn.fail_msg = error_description
            return await txn.save();
        } else throw new ConflictException('Data Mismatch!');
    }

    // ---------------------------------Init Payment---------------------------

    async initializeDeposit(user: User, amount: number) {
        if (amount <= 0) throw new BadRequestException('Amount must be greater than zero!')
        const instance = new Razorpay({key_id: RazorpayConfig.keyId, key_secret: RazorpayConfig.keySecret});
        const options = {
            amount: amount * 100,
            currency: "INR",
            notes: {
                user_type: "agent"
            }
        };
        const order = await instance.orders.create(options);
        const txn = new Transaction();
        txn.user = user;
        txn.amount = +amount;
        txn.remark = `Deposit ${amount}`;
        txn.txn_status = TxnStatus.Processing;
        txn.order_id = order.id;
        await txn.save();
        return order;
    }

    async initializeStudentSubscription(user: User) {
        const subscription = await this.studentService.getSubscription(user);
        if (subscription.subscribed) throw new ConflictException("Already Subscribed!");
        if (user.student.subscription_txn && user.student.subscription_txn.razorpay_order) {
            return await JSON.parse(user.student.subscription_txn.razorpay_order);
        }
        const instance = new Razorpay({key_id: RazorpayConfig.keyId, key_secret: RazorpayConfig.keySecret});

        const options = {
            amount: 36000,
            currency: "INR",
            notes: {
                user_type: "student"
            }
        };
        try{
            const order = await instance.orders.create(options);
            const txn = new Transaction();
            txn.order_id = order.id
            txn.amount = order.amount / 100
            txn.txn_status = TxnStatus.Processing
            txn.razorpay_order = JSON.stringify(order);
            txn.user = user
            user.student.subscription_txn = txn;
            await user.student.save();
            return order;
        }catch (e) {
            this.logger.error(e.message)
        }

    }

    // --------------------------------Payment Done----------------------------------

    async verifyRazorpaySignature(payment_response) {
        const hmac = await crypto.createHmac('sha256', RazorpayConfig.keySecret);
        hmac.update(payment_response.order_id + "|" + payment_response.payment_id);
        const generatedSignature = await hmac.digest('hex');
        if (generatedSignature !== payment_response.signature) {
            throw new BadRequestException('Payment Verification Failed!')
        }
    }

    async onStudentPaymentDone(user: User, paymentResponse) {
        await this.verifyRazorpaySignature(paymentResponse);
        user.student.paid_at = new Date();
        user.student.activation_requested = false;
        user.student.subscription_txn.txn_status  = TxnStatus.Successful;
        await user.student.save();

        return await this.connection.transaction(async manager => {

            const agentRepository = manager.getRepository<Agent>("agent");
            const txnRepo = manager.getRepository<Transaction>("transaction");

            const ancestor = await agentRepository.findOne({
                where: {
                    id: user.ancestor_id,
                },
                relations: ['user']
            })
            if(ancestor) {
                const commissionTxn = new Transaction();
                commissionTxn.user = ancestor.user;
                commissionTxn.amount = +120;
                commissionTxn.remark = `Commission - Activation of ${user.student.name}`;
                commissionTxn.txn_status = TxnStatus.Successful;
                commissionTxn.order_id = paymentResponse.order_id;
                await txnRepo.save(commissionTxn);

                await agentRepository.createQueryBuilder()
                    .update(Agent)
                    .set({balance: () => `balance + 120`})
                    .where("id = :id", {id: ancestor.id})
                    .execute();
            }

        });
    }

    async onDepositSuccess(user: User, paymentResponse) {
        await this.verifyRazorpaySignature(paymentResponse);
        return await this.connection.transaction(async manager => {
            const agentRepository = manager.getRepository<Agent>("agent");
            const txnRepo = manager.getRepository<Transaction>("transaction");

            const txn = await txnRepo.findOne({
                where: {
                    order_id: paymentResponse.order_id
                },
                relations: ["user"]
            });
            if (txn.txn_status !== TxnStatus.Processing) return "Already Settled!"

            if (txn && user.id === txn.user.id) {
                await agentRepository.createQueryBuilder()
                    .update(Agent)
                    .set({balance: () => `balance + ${txn.amount}`})
                    .where("id = :id", {id: user.agent.id})
                    .execute();
                txn.txn_status = TxnStatus.Successful;
                await txnRepo.save(txn);
            } else throw new InternalServerErrorException("Something went wrong!")
        });
    }

    // -------------------------------Transactions--------------------------------

    async activateStudents(user: User, idString: string) {
        const ids = idString.split(",");
        const cost = ids.length * 360;
        const commission = ids.length * 120;
        const diff = ids.length * 240;

        if (cost > user.agent.balance) throw new ConflictException("Insufficient Mulya");

        const costTxn = new Transaction();
        costTxn.user = user;
        costTxn.amount = -cost;
        costTxn.remark = `Activation of ${ids.length} student`;
        costTxn.txn_status = TxnStatus.Successful;
        costTxn.order_id = `Activation of ${ids.length} student`;

        const commissionTxn = new Transaction();
        commissionTxn.user = user;
        commissionTxn.amount = +commission;
        commissionTxn.remark = `Commission - Activation of ${ids.length} student`;
        commissionTxn.txn_status = TxnStatus.Successful;
        commissionTxn.order_id = `Commission - Activation of ${ids.length} student`;

        return await this.connection.transaction(async manager => {

            const studentRepository = manager.getRepository<Student>("student");
            const agentRepository = manager.getRepository<Agent>("agent");
            const txnRepo = manager.getRepository<Transaction>("transaction");

            const student_count = await studentRepository.createQueryBuilder()
                .where({
                    id: In(ids),
                    paid_at: IsNull()
                }).getCount()

            if (student_count != ids.length) throw new ConflictException("Some students already activated!, Please refresh!");

            await studentRepository.createQueryBuilder()
                .update(Student)
                .set({
                    paid_at: new Date(),
                    subscription_txn: costTxn
                })
                .where("student.id IN (:...ids)", {ids: ids})
                .execute();

            await agentRepository.createQueryBuilder()
                .update(Agent)
                .set({balance: () => `balance - ${diff}`})
                .where("id = :id", {id: user.agent.id})
                .execute();

            await txnRepo.save([costTxn, commissionTxn])
        });
    }

    withdraw(agent: User, withdrawDto: WithdrawDto) {
        if (agent.agent.balance == 0 || agent.agent.balance < withdrawDto.amount) throw new ConflictException("Insufficient Wallet Balance");
        return this.txnRepository.withdraw(agent, withdrawDto.amount, withdrawDto.upi_id, withdrawDto.remark);
    }

    getAgentTxns(agent: User) {
        return this.txnRepository.getAgentTxns(agent);
    }

}
