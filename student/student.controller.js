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
exports.StudentController = void 0;
const common_1 = require("@nestjs/common");
const student_service_1 = require("./student.service");
const student_initialization_dto_1 = require("./student-initialization.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const student_entity_1 = require("./student.entity");
const get_user_decorator_1 = require("../agent/get-user.decorator");
let StudentController = class StudentController {
    constructor(studentService) {
        this.studentService = studentService;
    }
    getDetails(student) {
        return student;
    }
    login(username, password) {
        return this.studentService.login(username, password);
    }
    initializeStudent(studentInitDto) {
        return this.studentService.initializeStudent(studentInitDto);
    }
};
__decorate([
    common_1.UseGuards(jwt_auth_guard_1.JwtAuthGuard),
    common_1.Get("details"),
    __param(0, get_user_decorator_1.GetUser()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [student_entity_1.Student]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "getDetails", null);
__decorate([
    common_1.Post("login"),
    __param(0, common_1.Body("username")), __param(1, common_1.Body("password")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "login", null);
__decorate([
    common_1.Post("initialize"),
    __param(0, common_1.Body(common_1.ValidationPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [student_initialization_dto_1.StudentInitializationDto]),
    __metadata("design:returntype", void 0)
], StudentController.prototype, "initializeStudent", null);
StudentController = __decorate([
    common_1.Controller("student"),
    __metadata("design:paramtypes", [student_service_1.StudentService])
], StudentController);
exports.StudentController = StudentController;
//# sourceMappingURL=student.controller.js.map