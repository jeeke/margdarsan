"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const txn_entity_1 = require("../../agent/txn.entity");
const common_1 = require("@nestjs/common");
const agent_entity_1 = require("../../agent/agent.entity");
const index_1 = require("typeorm/index");
const TxnResource = {
    resource: txn_entity_1.Transaction,
    options: {
        actions: {
            authorize: {
                actionType: "record",
                component: false,
                icon: "done",
                handler: async (request, response, data) => {
                    if (!data.record) {
                        throw new common_1.NotFoundException([
                            `Record of given id ("${request.params.recordId}") could not be found`
                        ].join("\n"), "Action#handler");
                    }
                    const txnStatus = data.record.param("txn_status");
                    if (txnStatus != 0) {
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
                        await index_1.getConnection().transaction(async (manager) => {
                            const txnRepository = manager.getRepository("transaction");
                            const agentRepository = manager.getRepository("agent");
                            await txnRepository.createQueryBuilder()
                                .update(txn_entity_1.Transaction)
                                .set({ txn_status: txn_entity_1.TxnStatus.Successful })
                                .where("transaction.id = :id", { id: request.params.recordId })
                                .execute();
                            await agentRepository.createQueryBuilder()
                                .update(agent_entity_1.Agent)
                                .set({ balance: () => `balance + ${data.record.param("amount")}` })
                                .where("agent.firebase_uid = :id", { id: uid })
                                .execute();
                        });
                    }
                    catch (error) {
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
                        throw new common_1.NotFoundException([
                            `Record of given id ("${request.params.recordId}") could not be found`
                        ].join("\n"), "Action#handler");
                    }
                    const txnStatus = data.record.param("txn_status");
                    if (txnStatus != 0) {
                        return {
                            record: data.record.toJSON(data.currentAdmin),
                            notice: {
                                message: "Already Settled",
                                type: "error"
                            }
                        };
                    }
                    try {
                        const txnRepository = index_1.getConnection().getRepository("transaction");
                        await txnRepository.createQueryBuilder()
                            .update(txn_entity_1.Transaction)
                            .set({ txn_status: txn_entity_1.TxnStatus.Declined })
                            .where("transaction.id = :id", { id: request.params.recordId })
                            .execute();
                    }
                    catch (error) {
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
exports.default = TxnResource;
//# sourceMappingURL=txn.resource.js.map