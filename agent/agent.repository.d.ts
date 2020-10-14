import { Repository } from "typeorm";
import { Agent } from "./agent.entity";
import { AgentSignupDto } from "./dto/agent-signup.dto";
export declare class AgentRepository extends Repository<Agent> {
    private logger;
    signUp(user: Agent, signupDto: AgentSignupDto): Promise<any>;
    login(phone: string): Promise<{
        initialized: boolean;
        phone: any;
        username: string;
        name: string;
        balance: number;
        level: number;
        sub_agents: number;
        paid_students: number;
    } | {
        initialized: boolean;
        phone: string;
        username: any;
    }>;
    getSubOrdinateAgents(user: Agent, downlineUsername: string): Promise<Agent[]>;
    getUserIfDownline(agent: Agent, downlineUsername: string): Promise<Agent>;
}
