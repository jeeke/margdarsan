import {Injectable} from "@nestjs/common";
import {AgentRepository} from "./agent.repository";
import {StudentRepository} from "../student/student.repository";
import {Like} from "typeorm/index";
import {User} from "../entities/user.entity";
import {UserType} from "../auth/jwt-payload.interface";

@Injectable()
export class AgentService {
    constructor(
        private agentRepository: AgentRepository,
        private studentRepository: StudentRepository
    ) {
    }

    async getDetails(user: User) {
        const team_size = await User.createQueryBuilder("user").where({
            ancestry: Like(`%/${user.id}/%`),
            user_type: UserType.Agent
        }).getCount()
        const student_count = await User.createQueryBuilder("student").where({
            user_type: UserType.Student,
            ancestor_id: user.id
        }).getCount()

        const r = user.toSignedInUser(UserType.Agent, !!user.agent)
        r.agent.paid_students = student_count
        r.agent.sub_agents = team_size
        return r;
    }

    getActivationRequests(user: User) {
        return this.studentRepository.getActivationRequests(user.id);
    }

    getSubOrdinateAgents(agent: User, downlineAgentId: number) {
        return this.agentRepository.getSubOrdinateAgents(agent, downlineAgentId);
    }
}
