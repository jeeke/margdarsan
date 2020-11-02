import {EntityRepository, Repository} from "typeorm";
import {Logger} from "@nestjs/common";
import {Agent} from "./agent.entity";
import {Transaction} from "./txn.entity";
import {User} from "../auth/user.entity";
import {TxnStatus} from "./txn.status";

@EntityRepository(Agent)
export class TxnRepository extends Repository<Transaction> {
    private logger = new Logger("AgentRepository");

    deposit(agent: User, amount: number, txn_time: string, txn_code: string, remark: string) {
        const txn = new Transaction();
        txn.agent_id = agent.agent.id;
        txn.amount = amount;
        txn.txn_time = txn_time;
        txn.txn_code = txn_code;
        txn.remark = remark;
        txn.txn_status = TxnStatus.Processing;
        return txn.save();
    }

    withdraw(user: User, amount: number, upi_id: string, remark: string) {
        const txn = new Transaction();
        txn.agent_id = user.agent.id;
        txn.amount = -amount;
        txn.upi_id = upi_id
        txn.txn_time = new Date().toDateString();
        txn.remark = remark;
        txn.txn_status = TxnStatus.Processing;
        txn.txn_code = `Withdraw ${user.agent.name}`;
        return txn.save();
    }

    async getTxns(user: User) {
        return {
            txns: await Transaction.find({
                where: {
                    agent_id: user.agent.id
                },
                order: {
                    id: "DESC"
                }
            }),
            balance: user.agent.balance
        };
    }
}