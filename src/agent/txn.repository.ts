import { EntityRepository, Repository } from "typeorm";
import { Logger } from "@nestjs/common";
import { Agent } from "./agent.entity";
import { Transaction, TxnStatus } from "./txn.entity";

@EntityRepository(Agent)
export class TxnRepository extends Repository<Transaction> {
  private logger = new Logger("AgentRepository");

  deposit(agent: Agent, amount: number, txn_time: string, txn_code: string, remark: string) {
    const txn = new Transaction();
    txn.agent_id = agent.id;
    txn.amount = amount;
    txn.txn_time = txn_time;
    txn.txn_code = txn_code;
    txn.remark = remark;
    txn.txn_status = TxnStatus.Processing;
    return txn.save();
  }

  withdraw(agent: Agent, amount: number, remark: string) {
    const txn = new Transaction();
    txn.agent_id = agent.id;
    txn.amount = -amount;
    txn.txn_time = new Date().toDateString();
    txn.remark = remark;
    txn.txn_status = TxnStatus.Processing;
    txn.txn_code = `Withdraw ${agent.name}`;
    return txn.save();
  }

  async getTxns(agent: Agent) {
    return {
      txns: await Transaction.find({
        where: {
          agent_id: agent.id
        }
      }),
      balance: agent.balance
    };
  }
}