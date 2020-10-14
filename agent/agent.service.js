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
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const agent_repository_1 = require("./agent.repository");
const agent_entity_1 = require("./agent.entity");
const student_repository_1 = require("../student/student.repository");
const txn_repository_1 = require("./txn.repository");
const student_entity_1 = require("../student/student.entity");
const index_1 = require("typeorm/index");
const admin = require("firebase-admin");
const jwt_payload_interface_1 = require("../student/jwt-payload.interface");
const jwt_1 = require("@nestjs/jwt");
let AgentService = class AgentService {
    constructor(agentRepository, studentRepository, txnRepository, connection, jwtService) {
        this.agentRepository = agentRepository;
        this.studentRepository = studentRepository;
        this.txnRepository = txnRepository;
        this.connection = connection;
        this.jwtService = jwtService;
    }
    async signUp(user, signupDto) {
        return this.agentRepository.signUp(user, signupDto);
    }
    async login(firebaseToken) {
        try {
            const decodedIdToken = await admin.auth().verifyIdToken(firebaseToken);
            const user = await this.agentRepository.login(decodedIdToken.phone_number);
            const payload = { phone: user.phone, username: user.username, user_type: jwt_payload_interface_1.UserType.Agent };
            const token = await this.jwtService.sign(payload);
            return Object.assign(Object.assign({}, user), { token });
        }
        catch (e) {
            throw new common_1.UnauthorizedException();
        }
    }
    generateStudentLogins(agent, prefix, count) {
        return this.studentRepository.generateStudentLogins(agent, prefix, count);
    }
    getUnactivatedStudents(agent) {
        return this.studentRepository.getUnActivatedStudents(agent.id);
    }
    getActivatedStudents(agent) {
        return this.studentRepository.getActivatedStudents(agent.id);
    }
    async getPaidStudents(agent, downlineUsername) {
        let downline;
        if (!downlineUsername || downlineUsername === agent.username) {
            downline = agent;
        }
        else
            downline = await this.agentRepository.getUserIfDownline(agent, downlineUsername);
        if (downline) {
            return this.studentRepository.getPaidStudents(downline.id);
        }
        else
            throw new common_1.UnauthorizedException("Network not Accessible");
    }
    withdraw(agent, withdrawDto) {
        if (agent.balance == 0 || agent.balance < withdrawDto.amount)
            throw new common_1.ConflictException("Insufficient Wallet Balance");
        return this.txnRepository.withdraw(agent, withdrawDto.amount, withdrawDto.remark);
    }
    deposit(agent, depositDto) {
        return this.txnRepository.deposit(agent, depositDto.amount, depositDto.txn_time, depositDto.txn_code, depositDto.remark);
    }
    getSubOrdinateAgents(agent, downlineUsername) {
        return this.agentRepository.getSubOrdinateAgents(agent, downlineUsername);
    }
    async activateStudents(agent, usernameString) {
        const usernames = usernameString.split(",");
        const cost = usernames.length * 360;
        if (cost > agent.balance)
            throw new common_1.ConflictException("Insufficient Wallet Balance");
        const timestamp = new Date().getTime().toString();
        return await this.connection.transaction(async (manager) => {
            const studentRepository = manager.getRepository("student");
            const agentRepository = manager.getRepository("agent");
            await studentRepository.createQueryBuilder()
                .update(student_entity_1.Student)
                .set({ paid_timestamp: timestamp })
                .where("student.username IN (:...usernames)", { usernames: usernames })
                .execute();
            await agentRepository.createQueryBuilder()
                .update(agent_entity_1.Agent)
                .set({ balance: () => `balance - ${cost}` })
                .execute();
        });
    }
    getTxns(agent) {
        return this.txnRepository.getTxns(agent);
    }
};
AgentService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(agent_repository_1.AgentRepository)),
    __metadata("design:paramtypes", [agent_repository_1.AgentRepository,
        student_repository_1.StudentRepository,
        txn_repository_1.TxnRepository,
        index_1.Connection,
        jwt_1.JwtService])
], AgentService);
exports.AgentService = AgentService;
//# sourceMappingURL=agent.service.js.map