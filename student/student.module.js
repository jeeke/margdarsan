"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentModule = void 0;
const common_1 = require("@nestjs/common");
const student_controller_1 = require("./student.controller");
const typeorm_1 = require("@nestjs/typeorm");
const student_service_1 = require("./student.service");
const student_repository_1 = require("./student.repository");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const config = require("config");
const jwt_strategy_1 = require("./jwt.strategy");
const agent_repository_1 = require("../agent/agent.repository");
const jwtConfig = config.get("jwt");
let StudentModule = class StudentModule {
};
StudentModule = __decorate([
    common_1.Module({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: "jwt" }),
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || jwtConfig.secret,
                signOptions: {
                    expiresIn: jwtConfig.expiresIn
                }
            }),
            typeorm_1.TypeOrmModule.forFeature([student_repository_1.StudentRepository, agent_repository_1.AgentRepository]),
        ],
        controllers: [student_controller_1.StudentController],
        providers: [student_repository_1.StudentRepository, student_service_1.StudentService, jwt_strategy_1.JwtStrategy, agent_repository_1.AgentRepository],
        exports: [
            student_repository_1.StudentRepository,
            jwt_1.JwtModule
        ]
    })
], StudentModule);
exports.StudentModule = StudentModule;
//# sourceMappingURL=student.module.js.map