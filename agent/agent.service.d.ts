import { AgentSignupDto } from "./dto/agent-signup.dto";
import { AgentRepository } from "./agent.repository";
import { Agent } from "./agent.entity";
import { StudentRepository } from "../student/student.repository";
import { TxnRepository } from "./txn.repository";
import { DepositDto } from "./dto/deposit.dto";
import { WithdrawDto } from "./dto/withdraw.dto";
import { Student } from "../student/student.entity";
import { Connection } from "typeorm/index";
import { JwtService } from "@nestjs/jwt";
export declare class AgentService {
    private agentRepository;
    private studentRepository;
    private txnRepository;
    private connection;
    private jwtService;
    constructor(agentRepository: AgentRepository, studentRepository: StudentRepository, txnRepository: TxnRepository, connection: Connection, jwtService: JwtService);
    signUp(user: Agent, signupDto: AgentSignupDto): Promise<any>;
    login(firebaseToken: string): Promise<any>;
    generateStudentLogins(agent: Agent, prefix: string, count: number): Promise<any[]>;
    getUnactivatedStudents(agent: Agent): Promise<Student[]>;
    getActivatedStudents(agent: Agent): Promise<Student[]>;
    getPaidStudents(agent: Agent, downlineUsername: string): Promise<Student[]>;
    withdraw(agent: Agent, withdrawDto: WithdrawDto): Promise<import("./txn.entity").Transaction>;
    deposit(agent: Agent, depositDto: DepositDto): Promise<import("./txn.entity").Transaction>;
    getSubOrdinateAgents(agent: Agent, downlineUsername: string): Promise<Agent[]>;
    activateStudents(agent: Agent, usernameString: string): Promise<void>;
    getTxns(agent: Agent): Promise<{
        txns: import("./txn.entity").Transaction[];
        balance: number;
    }>;
}
