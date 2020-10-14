"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TxnRepository = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const agent_entity_1 = require("./agent.entity");
const txn_entity_1 = require("./txn.entity");
let TxnRepository = class TxnRepository extends typeorm_1.Repository {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger("AgentRepository");
    }
    deposit(agent, amount, txn_time, txn_code, remark) {
        const txn = new txn_entity_1.Transaction();
        txn.agent_id = agent.id;
        txn.amount = amount;
        txn.txn_time = txn_time;
        txn.txn_code = txn_code;
        txn.remark = remark;
        txn.txn_status = txn_entity_1.TxnStatus.Processing;
        return txn.save();
    }
    withdraw(agent, amount, remark) {
        const txn = new txn_entity_1.Transaction();
        txn.agent_id = agent.id;
        txn.amount = -amount;
        txn.txn_time = new Date().toDateString();
        txn.remark = remark;
        txn.txn_status = txn_entity_1.TxnStatus.Processing;
        txn.txn_code = `Withdraw ${agent.name}`;
        return txn.save();
    }
    async getTxns(agent) {
        return {
            txns: await txn_entity_1.Transaction.find({
                where: {
                    agent_id: agent.id
                }
            }),
            balance: agent.balance
        };
    }
};
TxnRepository = __decorate([
    typeorm_1.EntityRepository(agent_entity_1.Agent)
], TxnRepository);
exports.TxnRepository = TxnRepository;
//# sourceMappingURL=txn.repository.js.map