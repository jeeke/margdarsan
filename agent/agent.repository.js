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
exports.AgentRepository = void 0;
const typeorm_1 = require("typeorm");
const common_1 = require("@nestjs/common");
const agent_entity_1 = require("./agent.entity");
let AgentRepository = class AgentRepository extends typeorm_1.Repository {
    constructor() {
        super(...arguments);
        this.logger = new common_1.Logger("AgentRepository");
    }
    async signUp(user, signupDto) {
        const { username, name, agentCode } = signupDto;
        const agent = new agent_entity_1.Agent();
        agent.username = username;
        agent.name = name;
        agent.phone = user.phone;
        agent.balance = 0;
        agent.level = 0;
        agent.sub_agents = 0;
        agent.paid_students = 0;
        const ancestor = await agent_entity_1.Agent.findOne({
            where: {
                username: agentCode
            }
        });
        if (ancestor) {
            agent.ancestor_id = ancestor.id;
            agent.ancestry = `${ancestor.ancestry}/${ancestor.id}`;
            agent.height = ancestor.height + 1;
        }
        else {
            agent.ancestor_id = -1;
            agent.ancestry = "";
            agent.height = 1;
        }
        try {
            await agent.save();
            const { id, ancestry, height, ancestor_id } = agent, r = __rest(agent, ["id", "ancestry", "height", "ancestor_id"]);
            return r;
        }
        catch (error) {
            if (error.code === "23505") {
                throw new common_1.ConflictException("Username already exists");
            }
            else {
                throw new common_1.InternalServerErrorException();
            }
        }
    }
    async login(phone) {
        const agent = await agent_entity_1.Agent.findOne({
            where: {
                phone: phone
            }
        });
        if (agent) {
            const { id, ancestry, height, ancestor_id, phone } = agent, r = __rest(agent, ["id", "ancestry", "height", "ancestor_id", "phone"]);
            return Object.assign(Object.assign({}, r), { initialized: true, phone: null });
        }
        return { initialized: false, phone, username: null };
    }
    async getSubOrdinateAgents(user, downlineUsername) {
        const downline = await this.getUserIfDownline(user, downlineUsername);
        if (downline) {
            return agent_entity_1.Agent.find({
                where: {
                    ancestor_id: downline.id
                }
            });
        }
        else
            throw new common_1.UnauthorizedException("Network not Accessible");
    }
    async getUserIfDownline(agent, downlineUsername) {
        if (!downlineUsername || agent.username === downlineUsername)
            return agent;
        const downline = await agent_entity_1.Agent.findOne({
            where: {
                username: downlineUsername
            }
        });
        if (downline && downline.ancestor_id === agent.id || downline.ancestry.includes(`/${agent.id}/`)) {
            return downline;
        }
    }
};
AgentRepository = __decorate([
    typeorm_1.EntityRepository(agent_entity_1.Agent)
], AgentRepository);
exports.AgentRepository = AgentRepository;
//# sourceMappingURL=agent.repository.js.map