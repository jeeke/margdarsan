import {ConflictException, Injectable, UnauthorizedException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {AgentRepository} from "./agent.repository";
import {Agent} from "./agent.entity";
import {StudentRepository} from "../student/student.repository";
import {TxnRepository} from "./txn.repository";
import {DepositDto} from "./dto/deposit.dto";
import {WithdrawDto} from "./dto/withdraw.dto";
import {Student} from "../student/student.entity";
import {Connection, IsNull, Like, Not} from "typeorm/index";
import {User} from "../auth/user.entity";
import {UserType} from "../auth/jwt-payload.interface";

@Injectable()
export class AgentService {
    constructor(
        @InjectRepository(AgentRepository)
        private agentRepository: AgentRepository,
        private studentRepository: StudentRepository,
        private txnRepository: TxnRepository,
        private connection: Connection
    ) {
    }

    async getDetails(user: User) {
        const team_size = await Agent.createQueryBuilder("agent").where({
            ancestry: Like(`%/${user.id}/%`)
        }).getCount()
        const student_count = await Student.createQueryBuilder("student").where({
            ancestry: Like(`%/${user.id}/%`),
            paid_at: Not(IsNull()),
        }).getCount()

        const r = user.toSignedInUser(UserType.Agent, !!user.agent)
        r.agent.paid_students = student_count
        r.agent.sub_agents = team_size
        return r;
    }

    getUnactivatedStudents(agent: Agent) {
        return this.studentRepository.getUnActivatedStudents(agent.id);
    }

    getActivatedStudents(agent: Agent) {
        return this.studentRepository.getActivatedStudents(agent.id);
    }

    async getPaidStudents(agent: User, downlineUsername: string) {
        let downline;
        if (!downlineUsername || downlineUsername === agent.username) {
            downline = agent;
        } else downline = await this.agentRepository.getUserIfDownline(agent, downlineUsername);
        if (downline) {
            return this.studentRepository.getPaidStudents(downline.id);
        } else throw new UnauthorizedException("Network not Accessible");
    }

    withdraw(agent: User, withdrawDto: WithdrawDto) {
        if (agent.agent.balance == 0 || agent.agent.balance < withdrawDto.amount) throw new ConflictException("Insufficient Wallet Balance");
        return this.txnRepository.withdraw(agent, withdrawDto.amount, withdrawDto.upi_id, withdrawDto.remark);
    }

    deposit(agent: Agent, depositDto: DepositDto) {
        return this.txnRepository.deposit(agent, depositDto.amount, depositDto.txn_time, depositDto.txn_code, depositDto.remark);
    }

    getSubOrdinateAgents(agent: User, downlineUsername: string) {
        return this.agentRepository.getSubOrdinateAgents(agent, downlineUsername);
    }

    async activateStudents(agent: User, idString: string) {
        const ids = idString.split(",");
        const cost = ids.length * 360;
        if (cost > agent.agent.balance) throw new ConflictException("Insufficient Wallet Balance");
        return await this.connection.transaction(async manager => {

            const studentRepository = manager.getRepository<Student>("student");
            const agentRepository = manager.getRepository<Agent>("agent");

            await studentRepository.createQueryBuilder()
                .update(Student)
                .set({paid_at: new Date()})
                .where("student.id IN (:...ids)", {ids: ids})
                .execute();
            await agentRepository.createQueryBuilder()
                .update(Agent)
                .set({balance: () => `balance - ${cost}`})
                .execute();
        });
    }

    getTxns(agent: Agent) {
        return this.txnRepository.getTxns(agent);
    }
}
