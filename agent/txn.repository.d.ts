import { Repository } from "typeorm";
import { Agent } from "./agent.entity";
import { Transaction } from "./txn.entity";
export declare class TxnRepository extends Repository<Transaction> {
    private logger;
    deposit(agent: Agent, amount: number, txn_time: string, txn_code: string, remark: string): Promise<Transaction>;
    withdraw(agent: Agent, amount: number, remark: string): Promise<Transaction>;
    getTxns(agent: Agent): Promise<{
        txns: Transaction[];
        balance: number;
    }>;
}
