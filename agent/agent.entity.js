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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const typeorm_1 = require("typeorm");
let Agent = class Agent extends typeorm_1.BaseEntity {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Agent.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Agent.prototype, "username", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Agent.prototype, "phone", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Agent.prototype, "name", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Agent.prototype, "balance", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Agent.prototype, "level", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Agent.prototype, "height", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Agent.prototype, "sub_agents", void 0);
__decorate([
    typeorm_1.Column({ nullable: true }),
    __metadata("design:type", Number)
], Agent.prototype, "paid_students", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Agent.prototype, "ancestor_id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Agent.prototype, "ancestry", void 0);
Agent = __decorate([
    typeorm_1.Entity(),
    typeorm_1.Unique(["username", "phone"])
], Agent);
exports.Agent = Agent;
//# sourceMappingURL=agent.entity.js.map