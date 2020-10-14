"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRepository = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const bcrypt = require("bcryptjs");
const student_entity_1 = require("./student.entity");
const generator = require("generate-password");
const index_1 = require("typeorm/index");
let StudentRepository = class StudentRepository extends typeorm_1.Repository {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger("StudentRepository");
    }
    async validateUserPassword(username, password) {
        const student = await student_entity_1.Student.findOne({
            where: {
                username: username
            }
        });
        if (student && await student.validatePassword(password)) {
            const { id, password, ancestry, salt } = student, result = __rest(student, ["id", "password", "ancestry", "salt"]);
            const initialized = salt != null;
            return Object.assign(Object.assign({}, result), { initialized });
        }
        else
            throw new common_1.UnauthorizedException("Invalid Credentials!");
    }
    async generateStudentLogins(agent, prefix, count) {
        const s = [];
        const passwords = await generator.generateMultiple(count, {
            length: 8,
            numbers: true
        });
        for (let i = 0; i < count; i++) {
            const student = new student_entity_1.Student();
            student.username = `${prefix}${i + 1}`;
            student.password = passwords[i];
            student.ancestor_id = agent.id;
            student.ancestry = `${agent.ancestry}/${agent.id}`;
            s.push(student);
        }
        try {
            return await student_entity_1.Student.save(s);
        }
        catch (e) {
            if (e.code === "23505")
                throw new common_1.ConflictException("Please enter different prefix");
            else
                throw new common_1.InternalServerErrorException();
        }
    }
    getPaidStudents(agentId) {
        return student_entity_1.Student.find({
            where: {
                ancestor_id: agentId,
                paid_timestamp: index_1.Not(index_1.IsNull())
            },
            select: ["username", "name"]
        });
    }
    async getUnActivatedStudents(agentId) {
        return student_entity_1.Student.find({
            where: {
                ancestor_id: agentId,
                paid_timestamp: index_1.IsNull(),
                salt: index_1.IsNull()
            },
            select: ["username", "password"]
        });
    }
    async getActivatedStudents(agentId) {
        return student_entity_1.Student.find({
            where: {
                ancestor_id: agentId,
                paid_timestamp: index_1.IsNull(),
                salt: index_1.Not(index_1.IsNull())
            },
            select: ["username", "name"]
        });
    }
    async updateDetails(studentInitDto) {
        const student = await student_entity_1.Student.findOne({
            where: {
                username: studentInitDto.username
            }
        });
        if (student && student.salt)
            return new common_1.ConflictException("Already Initialized");
        if (student && student.password === studentInitDto.password) {
            student.salt = await bcrypt.genSalt();
            student.password = await bcrypt.hash(studentInitDto.new_password, student.salt);
            student.name = studentInitDto.name;
            student.grade = studentInitDto.grade;
            student.school = studentInitDto.school;
            student.area = studentInitDto.area;
            await student.save();
            const { id, password, salt, ancestry } = student, result = __rest(student, ["id", "password", "salt", "ancestry"]);
            return result;
        }
        else
            throw new common_1.UnauthorizedException("Invalid Credentials!");
    }
};
StudentRepository = __decorate([
    typeorm_1.EntityRepository(student_entity_1.Student)
], StudentRepository);
exports.StudentRepository = StudentRepository;
//# sourceMappingURL=student.repository.js.map