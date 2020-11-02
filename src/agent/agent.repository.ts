import {EntityRepository, Repository} from "typeorm";
import {Logger, UnauthorizedException} from "@nestjs/common";
import {Agent} from "./agent.entity";
import {User} from "../auth/user.entity";

@EntityRepository(Agent)
export class AgentRepository extends Repository<Agent> {
    private logger = new Logger("AgentRepository");

    async getSubOrdinateAgents(user: User, downlineAgentId: number) {
        const downline = await this.getUserIfDownline(user, downlineAgentId);
        if (downline) {
            return await Agent.find({
                where: {
                    ancestor_id: downline.id,
                },
                select: ["id","name"]
            });
        } else throw new UnauthorizedException("Network not Accessible");
    }

    async getUserIfDownline(user: User, downlineAgentId: number) {
        if (!downlineAgentId || user.agent.id === downlineAgentId) return user.agent;
        const downline = await Agent.findOne({
            where: {
                id: downlineAgentId
            }
        });
        if (downline && (downline.ancestor_id === user.agent.id) || downline.ancestry.includes(`/${user.agent.id}/`)) {
            return downline;
        }
    }
}