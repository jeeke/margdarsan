import {EntityRepository, Repository} from "typeorm";
import {Logger, UnauthorizedException} from "@nestjs/common";
import {Agent} from "../entities/agent.entity";
import {User} from "../entities/user.entity";

@EntityRepository(Agent)
export class AgentRepository extends Repository<Agent> {
    private logger = new Logger("AgentRepository");

    async getSubOrdinateAgents(user: User, downlineId: number) {
        const downlineAgent = await this.getAgentIfDownline(user, downlineId);
        if (downlineAgent) {
            return User.find({
                where: {
                    ancestor_id: downlineAgent.id
                },
                relations: ["agent"],
                select: ["id","agent"]
            })
        } else throw new UnauthorizedException("Network not Accessible");
    }

    async getAgentIfDownline(user: User, downlineId: number) {
        if (!downlineId || user.agent.id === downlineId) return user.agent;
        const downline = await Agent.findOne({
            where: {
                id: downlineId
            },
            relations: ["user"]
        });
        if (downline && (downline.user.ancestor_id === user.agent.id) || downline.user.ancestry.includes(`/${user.agent.id}/`)) {
            return downline;
        }
    }
}