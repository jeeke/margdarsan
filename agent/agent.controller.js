"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentController = void 0;
const common_1 = require("@nestjs/common");
const get_user_decorator_1 = require("./get-user.decorator");
const agent_signup_dto_1 = require("./dto/agent-signup.dto");
const agent_service_1 = require("./agent.service");
const agent_entity_1 = require("./agent.entity");
const deposit_dto_1 = require("./dto/deposit.dto");
const withdraw_dto_1 = require("./dto/withdraw.dto");
const jwt_auth_guard_1 = require("../student/jwt-auth.guard");
let AgentController = class AgentController {
    constructor(agentService) {
        this.agentService = agentService;
    }
    signUp(user, signupDto) {
        return this.agentService.signUp(user, signupDto);
    }
    login(token) {
        return this.agentService.login(token);
    }
    generateStudentLogins(agent, prefix, count) {
        return this.agentService.generateStudentLogins(agent, prefix, count);
    }
    getUnactivatedStudents(agent) {
        return this.agentService.getUnactivatedStudents(agent);
    }
    getActivatedStudents(agent) {
        return this.agentService.getActivatedStudents(agent);
    }
    getPaidStudents(agent, downlineUsername) {
        return this.agentService.getPaidStudents(agent, downlineUsername);
    }
    deposit(agent, depositDto) {
        return this.agentService.deposit(agent, depositDto);
    }
    withdraw(agent, withdrawDto) {
        return this.agentService.withdraw(agent, withdrawDto);
    }
    getTxns(agent) {
        return this.agentService.getTxns(agent);
    }
    activateStudents(agent, usernames) {
        return this.agentService.activateStudents(agent, usernames);
    }
    getSubOrdinateAgents(agent, downlineUsername) {
        return this.agentService.getSubOrdinateAgents(agent, downlineUsername);
    }
};
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Post("/signup"),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Body(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_entity_1.Agent, agent_signup_dto_1.AgentSignupDto]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "signUp", null);
__decorate([
    common_1.Post("/login"),
    __param(0, common_1.Body("firebase_token")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "login", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Post("student-logins"),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Body("prefix")), __param(2, common_1.Body("count")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_entity_1.Agent, String, Number]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "generateStudentLogins", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Get("unactivated-students"),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_entity_1.Agent]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "getUnactivatedStudents", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Get("activated-students"),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_entity_1.Agent]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "getActivatedStudents", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Get("paid-students"),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Query("downline_username")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_entity_1.Agent, String]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "getPaidStudents", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Post("deposit"),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Body(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_entity_1.Agent, deposit_dto_1.DepositDto]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "deposit", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Post("withdraw"),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Body(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_entity_1.Agent, withdraw_dto_1.WithdrawDto]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "withdraw", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Get("txns"),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_entity_1.Agent]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "getTxns", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Post("activated-students"),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Body("usernames")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_entity_1.Agent, String]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "activateStudents", null);
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Get("sub-agents"),
    __param(0, get_user_decorator_1.GetUser()), __param(1, common_1.Query("downline_username")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [agent_entity_1.Agent, String]),
    __metadata("design:returntype", void 0)
], AgentController.prototype, "getSubOrdinateAgents", null);
AgentController = __decorate([
    common_1.Controller("agent"),
    __metadata("design:paramtypes", [agent_service_1.AgentService])
], AgentController);
exports.AgentController = AgentController;
//# sourceMappingURL=agent.controller.js.map