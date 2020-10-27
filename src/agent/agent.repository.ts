import {EntityRepository, Repository} from "typeorm";
import {Logger, UnauthorizedException} from "@nestjs/common";
import {Agent} from "./agent.entity";
import {User} from "../auth/user.entity";

@EntityRepository(Agent)
export class AgentRepository extends Repository<Agent> {
    private logger = new Logger("AgentRepository");

    async getSubOrdinateAgents(user: User, downlineUsername: string) {
        const downline = await this.getUserIfDownline(user, downlineUsername);
        if (downline) {
            const agents = await Agent.find({
                where: {
                    ancestor_id: downline.id,
                },
                relations: ["user"]
            });
            return agents.map(a => {
                return {
                    username: a.user.username,
                    name: a.user.name
                }
            })
        } else throw new UnauthorizedException("Network not Accessible");
    }

    async getUserIfDownline(agent: User, downlineUsername: string) {
        if (!downlineUsername || agent.username === downlineUsername) return agent;
        const downline = await User.findOne({
            where: {
                username: downlineUsername
            }
        });
        if (downline && downline.agent.ancestor_id === agent.id || downline.agent.ancestry.includes(`/${agent.id}/`)) {
            return downline;
        }
    }
}