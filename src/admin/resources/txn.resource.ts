import { ResourceWithOptions } from "admin-bro";
import { Transaction, TxnStatus } from "../../agent/txn.entity";
import { NotFoundException } from "@nestjs/common";
import { Agent } from "../../agent/agent.entity";
import { getConnection } from "typeorm/index";

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
          if (txnStatus  != 0 ) {
            return {
              record: data.record.toJSON(data.currentAdmin),
              notice: {
                message: "Already Settled",
                type: "error"
              }
            };
          }
          const uid = data.record.param("firebase_uid");
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
                .where("agent.firebase_uid = :id", { id: uid })
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
          if (txnStatus  != 0 ) {
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
              .set({ txn_status: TxnStatus.Declined })
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