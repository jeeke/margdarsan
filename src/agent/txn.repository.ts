import {EntityRepository, Repository} from "typeorm";
import {Logger} from "@nestjs/common";
import {Agent} from "../entities/agent.entity";
import {Transaction} from "../entities/txn.entity";
import {User} from "../entities/user.entity";
import {TxnStatus} from "./txn.status";

@EntityRepository(Agent)
export class TxnRepository extends Repository<Transaction> {
    private logger = new Logger("AgentRepository");

    // deposit(user: User, amount: number, txn_time: Date, txn_code: string, remark: string) {
    //     const txn = new Transaction();
    //     txn.user = user;
    //     txn.amount = amount;
    //     txn.created_at = txn_time;
    //     txn.txn_code = txn_code;
    //     txn.remark = remark;
    //     txn.txn_status = TxnStatus.Processing;
    //     return txn.save();
    // }

    withdraw(user: User, amount: number, upi_id: string, remark: string) {
        const txn = new Transaction();
        txn.user = user;
        txn.amount = -amount;
        txn.upi_id = upi_id
        txn.remark = remark;
        txn.txn_status = TxnStatus.Processing;
        txn.order_id = `Withdraw ${user.agent.name}`;
        return txn.save();
    }

    async getAgentTxns(user: User) {
        return {
            txns: await Transaction.createQueryBuilder("txn")
                .innerJoinAndSelect("txn.user", "user", "user.id = :userId", {userId: user.id})
                .orderBy("created_at", "DESC")
                .getMany(),
            //     await Transaction.find({
            //     relations: ["user"],
            //     where: {
            //         'user.id' : user.id
            //     },
            //     order: {
            //         id: "DESC"
            //     }
            // })
            balance: user.agent.balance
        };
    }
}