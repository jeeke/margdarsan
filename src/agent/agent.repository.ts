import { Repository, EntityRepository } from "typeorm";
import {
  ConflictException,
  InternalServerErrorException, Logger,UnauthorizedException
} from "@nestjs/common";
import { Agent } from "./agent.entity";
import { AgentSignupDto } from "./dto/agent-signup.dto";

@EntityRepository(Agent)
export class AgentRepository extends Repository<Agent> {
  private logger = new Logger("AgentRepository");

  async signUp(user: Agent, signupDto: AgentSignupDto): Promise<any> {
    const { username, name, agentCode } = signupDto;

    const agent = new Agent();
    agent.username = username;
    agent.name = name;
    agent.phone = user.phone;
    agent.balance = 0;
    agent.level = 0;
    agent.sub_agents = 0;
    agent.paid_students = 0;

    const ancestor = await Agent.findOne({
      where: {
        username: agentCode
      }
    });
    if (ancestor) {
      agent.ancestor_id = ancestor.id;
      agent.ancestry = `${ancestor.ancestry}/${ancestor.id}`;
      agent.height = ancestor.height + 1;
    } else
      // throw new BadRequestException("Invalid Referral Code")
    {
      agent.ancestor_id = -1;
      agent.ancestry = "";
      agent.height = 1;
    }

    try {
      await agent.save();
      // increase ancestor sub count
      const { id, ancestry, height, ancestor_id, ...r } = agent;
      return r;
    } catch (error) {
      // this.logger.log(error.message, error.stack);
      if (error.code === "23505") {
        // duplicate username
        throw new ConflictException("Username already exists");
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async login(phone: string) {
    const agent = await Agent.findOne({
      where: {
        phone: phone
      }
    });
    if (agent) {
      const { id, ancestry, height, ancestor_id, phone, ...r } = agent;
      return { ...r, initialized: true, phone: null };
    }
    return { initialized: false, phone, username: null };
  }

  async getSubOrdinateAgents(user: Agent, downlineUsername: string) {
    const downline = await this.getUserIfDownline(user, downlineUsername);
    if (downline) {
      return Agent.find({
        where: {
          ancestor_id: downline.id
        }
      });
    } else throw new UnauthorizedException("Network not Accessible");
  }

  async getUserIfDownline(agent: Agent, downlineUsername: string) {
    if (!downlineUsername || agent.username === downlineUsername) return agent;
    const downline = await Agent.findOne({
      where: {
        username: downlineUsername
      }
    });
    if (downline && downline.ancestor_id === agent.id || downline.ancestry.includes(`/${agent.id}/`)) {
      return downline;
    }
  }
}