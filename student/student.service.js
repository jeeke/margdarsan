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
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const student_repository_1 = require("./student.repository");
const jwt_payload_interface_1 = require("./jwt-payload.interface");
const jwt_1 = require("@nestjs/jwt");
let StudentService = class StudentService {
    constructor(repository, jwtService) {
        this.repository = repository;
        this.jwtService = jwtService;
        this.logger = new common_1.Logger("StudentService");
    }
    async login(username, password) {
        const user = await this.repository.validateUserPassword(username, password);
        const loggedInUsername = user.username;
        const payload = { username: loggedInUsername, phone: null, user_type: jwt_payload_interface_1.UserType.Student };
        const token = await this.jwtService.sign(payload);
        this.logger.debug(`Generated JWT Token with payload ${JSON.stringify(payload)}`);
        return Object.assign(Object.assign({}, user), { token });
    }
    initializeStudent(studentInitDto) {
        return this.repository.updateDetails(studentInitDto);
    }
};
StudentService = __decorate([
    common_1.Injectable(),
    __param(0, typeorm_1.InjectRepository(student_repository_1.StudentRepository)),
    __metadata("design:paramtypes", [student_repository_1.StudentRepository,
        jwt_1.JwtService])
], StudentService);
exports.StudentService = StudentService;
//# sourceMappingURL=student.service.js.map