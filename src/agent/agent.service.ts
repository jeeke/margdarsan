import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { AgentSignupDto } from "./dto/agent-signup.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { AgentRepository } from "./agent.repository";
import { Agent } from "./agent.entity";
import { StudentRepository } from "../student/student.repository";
import { TxnRepository } from "./txn.repository";
import { DepositDto } from "./dto/deposit.dto";
import { WithdrawDto } from "./dto/withdraw.dto";
import { Student } from "../student/student.entity";
import { Connection, IsNull, Not } from "typeorm/index";
import * as admin from "firebase-admin";
import { JwtPayload, UserType } from "../student/jwt-payload.interface";
import { JwtService } from "@nestjs/jwt";
import { GetUser } from "./get-user.decorator";

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentRepository)
    private agentRepository: AgentRepository,
    private studentRepository: StudentRepository,
    private txnRepository: TxnRepository,
    private connection: Connection,
    private jwtService: JwtService
  ) {
  }

  async signUp(user: Agent, signupDto: AgentSignupDto): Promise<any> {
    return this.agentRepository.signUp(user, signupDto);
  }

  async login(firebaseToken: string): Promise<any> {
    try {
      const decodedIdToken = await admin.auth().verifyIdToken(firebaseToken);
      const user = await this.agentRepository.login(decodedIdToken.phone_number);
      const payload: JwtPayload = { phone: user.phone, username: user.username, user_type: UserType.Agent };
      const token = await this.jwtService.sign(payload);
      return { ...user, token };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  generateStudentLogins(agent: Agent, prefix: string, count: number) {
    return this.studentRepository.generateStudentLogins(agent, prefix, count);
  }

  getUnactivatedStudents(agent: Agent) {
    return this.studentRepository.getUnActivatedStudents(agent.id);
  }

  getActivatedStudents(agent: Agent) {
    return this.studentRepository.getActivatedStudents(agent.id);
  }

  async getPaidStudents(agent: Agent, downlineUsername: string) {
    let downline;
    if (!downlineUsername || downlineUsername === agent.username) {
      downline = agent;
    } else downline = await this.agentRepository.getUserIfDownline(agent, downlineUsername);
    if (downline) {
      return this.studentRepository.getPaidStudents(downline.id);
    } else throw new UnauthorizedException("Network not Accessible");
  }

  withdraw(agent: Agent, withdrawDto: WithdrawDto) {
    if (agent.balance == 0 || agent.balance < withdrawDto.amount) throw new ConflictException("Insufficient Wallet Balance");
    return this.txnRepository.withdraw(agent, withdrawDto.amount, withdrawDto.remark);
  }

  deposit(agent: Agent, depositDto: DepositDto) {
    return this.txnRepository.deposit(agent, depositDto.amount, depositDto.txn_time, depositDto.txn_code, depositDto.remark);
  }

  getSubOrdinateAgents(agent: Agent, downlineUsername: string) {
    return this.agentRepository.getSubOrdinateAgents(agent, downlineUsername);
  }

  async activateStudents(agent: Agent, usernameString: string) {
    const usernames = usernameString.split(",");
    const cost = usernames.length * 360;
    if (cost > agent.balance) throw new ConflictException("Insufficient Wallet Balance");
    const timestamp = new Date().getTime().toString();
    return await this.connection.transaction(async manager => {
      const studentRepository = manager.getRepository<Student>("student");
      const agentRepository = manager.getRepository<Agent>("agent");

      await studentRepository.createQueryBuilder()
        .update(Student)
        .set({ paid_timestamp: timestamp })
        .where("student.username IN (:...usernames)", { usernames: usernames })
        .execute();
      await agentRepository.createQueryBuilder()
        .update(Agent)
        .set({ balance: () => `balance - ${cost}` })
        .execute();
    });
  }

  getTxns(agent: Agent) {
    return this.txnRepository.getTxns(agent);
  }
}
