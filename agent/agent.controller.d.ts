import { AgentSignupDto } from "./dto/agent-signup.dto";
import { AgentService } from "./agent.service";
import { Agent } from "./agent.entity";
import { DepositDto } from "./dto/deposit.dto";
import { WithdrawDto } from "./dto/withdraw.dto";
export declare class AgentController {
    private agentService;
    constructor(agentService: AgentService);
    signUp(user: Agent, signupDto: AgentSignupDto): Promise<any>;
    login(token: any): Promise<any>;
    generateStudentLogins(agent: Agent, prefix: string, count: number): Promise<any[]>;
    getUnactivatedStudents(agent: Agent): Promise<import("../student/student.entity").Student[]>;
    getActivatedStudents(agent: Agent): Promise<import("../student/student.entity").Student[]>;
    getPaidStudents(agent: Agent, downlineUsername: string): Promise<import("../student/student.entity").Student[]>;
    deposit(agent: Agent, depositDto: DepositDto): Promise<import("./txn.entity").Transaction>;
    withdraw(agent: Agent, withdrawDto: WithdrawDto): Promise<import("./txn.entity").Transaction>;
    getTxns(agent: Agent): Promise<{
        txns: import("./txn.entity").Transaction[];
        balance: number;
    }>;
    activateStudents(agent: Agent, usernames: string): Promise<void>;
    getSubOrdinateAgents(agent: Agent, downlineUsername: string): Promise<Agent[]>;
}
