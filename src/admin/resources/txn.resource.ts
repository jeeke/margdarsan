import { ResourceWithOptions } from "admin-bro";
import { Transaction } from "../../entities/txn.entity";
import { NotFoundException } from "@nestjs/common";
import { Agent } from "../../entities/agent.entity";
import { getConnection } from "typeorm/index";
import {TxnStatus} from "../../agent/txn.status";

const TxnResource: ResourceWithOptions = {
  resource: Transaction,
  options: {
    actions: {
      authorize: {
        actionType: "record",
        component: false,
        icon: "done",
        handler: async (request, response, data) => {
          if (!data.record) {
            throw new NotFoundException([
              `Record of given id ("${request.params.recordId}") could not be found`
            ].join("\n"), "Action#handler");
          }
          const txnStatus = data.record.param("txn_status")
          if (txnStatus  != TxnStatus.Processing ) {
            return {
              record: data.record.toJSON(data.currentAdmin),
              notice: {
                message: "Already Settled",
                type: "error"
              }
            };
          }
          const uid = data.record.param("agent_id");
          try {
            await getConnection().transaction(async manager => {
              const txnRepository = manager.getRepository<Transaction>("transaction");
              const agentRepository = manager.getRepository<Agent>("agent");

              await txnRepository.createQueryBuilder()
                .update(Transaction)
                .set({ txn_status: TxnStatus.Successful })
                .where("transaction.id = :id", { id: request.params.recordId })
                .execute();
              await agentRepository.createQueryBuilder()
                .update(Agent)
                .set({ balance: () => `balance + ${data.record.param("amount")}` })
                .where("agent.id = :id", { id: uid })
                .execute();
            });
          } catch (error) {
            return {
              record: data.record.toJSON(data.currentAdmin),
              notice: {
                message: error.baseError.message,
                type: "error"
              }
            };
          }
          return {
            record: data.record.toJSON(data.currentAdmin),
            notice: {
              message: data.translateMessage("successfullyAuthorised", data.resource.id()),
              type: "success"
            }
          };
        }
      },
      decline: {
        actionType: "record",
        component: false,
        icon: "done",
        handler: async (request, response, data) => {
          if (!data.record) {
            throw new NotFoundException([
              `Record of given id ("${request.params.recordId}") could not be found`
            ].join("\n"), "Action#handler");
          }
          const txnStatus = data.record.param("txn_status")
          if (txnStatus  != TxnStatus.Processing ) {
            return {
              record: data.record.toJSON(data.currentAdmin),
              notice: {
                message: "Already Settled",
                type: "error"
              }
            };
          }
          try {
            const txnRepository = getConnection().getRepository<Transaction>("transaction");

            await txnRepository.createQueryBuilder()
              .update(Transaction)
              .set({ txn_status: TxnStatus.Failed })
              .where("transaction.id = :id", { id: request.params.recordId })
              .execute();
          } catch (error) {
            return {
              record: data.record.toJSON(data.currentAdmin),
              notice: {
                message: error.baseError.message,
                type: "error"
              }
            };
          }
          return {
            record: data.record.toJSON(data.currentAdmin),
            notice: {
              message: data.translateMessage("transactionDeclined", data.resource.id()),
              type: "success"
            }
          };
        }
      }
    }
  }
};

export default TxnResource;