import {EntityRepository, Repository} from "typeorm";
import {Logger, UnauthorizedException} from "@nestjs/common";
import {Agent} from "../entities/agent.entity";
import {User} from "../entities/user.entity";

@EntityRepository(Agent)
export class AgentRepository extends Repository<Agent> {
    private logger = new Logger("AgentRepository");

    async getSubOrdinateAgents(user: User, downlineId: number) {
        const downline = await this.getUserIfDownline(user, downlineId);
        if (downline) {
            return await User.find({
                where: {
                    ancestor_id: downline.id,
                },
                select: ["agent"]
            });
        } else throw new UnauthorizedException("Network not Accessible");
    }

    async getUserIfDownline(user: User, downlineId: number) {
        if (!downlineId || user.id === downlineId) return user;
        const downline = await User.findOne({
            where: {
                id: downlineId
            }
        });
        if (downline && (downline.ancestor_id === user.id) || downline.ancestry.includes(`/${user.id}/`)) {
            return downline;
        }
    }
}