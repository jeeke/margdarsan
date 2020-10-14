"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentModule = void 0;
const common_1 = require("@nestjs/common");
const agent_controller_1 = require("./agent.controller");
const agent_service_1 = require("./agent.service");
const agent_repository_1 = require("./agent.repository");
const typeorm_1 = require("@nestjs/typeorm");
const student_module_1 = require("../student/student.module");
const txn_repository_1 = require("./txn.repository");
const jwt_strategy_1 = require("../student/jwt.strategy");
const student_repository_1 = require("../student/student.repository");
let AgentModule = class AgentModule {
};
AgentModule = __decorate([
    common_1.Module({
        imports: [typeorm_1.TypeOrmModule.forFeature([agent_repository_1.AgentRepository]), student_module_1.StudentModule],
        controllers: [agent_controller_1.AgentController],
        providers: [agent_service_1.AgentService, agent_repository_1.AgentRepository, txn_repository_1.TxnRepository, jwt_strategy_1.JwtStrategy, student_repository_1.StudentRepository]
    })
], AgentModule);
exports.AgentModule = AgentModule;
//# sourceMappingURL=agent.module.js.map