import {BadRequestException, ConflictException, Injectable} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import * as admin from "firebase-admin";
import {SignedInUser, User} from "./user.entity";
import {Agent} from "../agent/agent.entity";
import {AgentSignupDto} from "../agent/dto/agent-signup.dto";
import {JwtPayload, UserType} from "./jwt-payload.interface";
import {LoginDto} from "./dto/login.dto";
import {StudentInitializationDto} from "./dto/student-initialization.dto";
import {Student} from "../student/student.entity";

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService
    ) {
    }

    async login(loginDto: LoginDto): Promise<any> {
        const decodedIdToken = await admin.auth().verifyIdToken(loginDto.token);
        const user = await User.findOne({
            where: {
                phone: decodedIdToken.phone_number
            }
        });
        let r: SignedInUser;
        if (user) {
            r = user.toSignedInUser(loginDto.user_type, true)
        } else {
            r = {
                phone: decodedIdToken.phone_number,
                user_type: loginDto.user_type,
                initialized: false,
                agent: null,
                student: null,
                token: null
            };
        }
        const payload: JwtPayload = {
            phone: r.phone,
            user_type: r.user_type,
            initialized: r.initialized
        };
        r.token = await this.jwtService.sign(payload);
        return r;
    }

    async initializeAgentProfile(user: User, agentSignUpDto: AgentSignupDto) {
        if (user.agent) throw new ConflictException("Already Signed Up!")

        const {my_referral_code, agent_referral_code, address, name} = agentSignUpDto;
        const agent = new Agent();
        agent.referral_code = my_referral_code.trim().toLowerCase();
        agent.name = name;
        agent.address = address
        user.is_admin = false;

        agent.balance = 0;
        agent.level = 0;
        agent.sub_agents = 0;
        agent.paid_students = 0;

        const ancestor = await Agent.findOne({
            where: {
                referral_code: agent_referral_code.trim().toLowerCase()
            }
        });
        if (ancestor) {
            agent.ancestor_id = ancestor.id;
            agent.ancestry = `${ancestor.ancestry}${ancestor.id}/`;
            agent.height = ancestor.height + 1;
        } else if (agent_referral_code) {
            throw new BadRequestException("Wrong Referral Code!")
        } else {
            agent.ancestry = '/';
            agent.height = 0;
        }
        user.agent = agent
        await user.save();

        const payload: JwtPayload = {
            phone: user.phone,
            user_type: UserType.Agent,
            initialized: true
        };
        const token = await this.jwtService.sign(payload);

        const signedInUser = user.toSignedInUser(UserType.Agent, true);
        signedInUser.token = token
        return signedInUser;

    }

    async initializeStudentProfile(user: User, studentInitDto: StudentInitializationDto) {
        if (user.student) throw new ConflictException("Already Signed Up!")
        const {agent_referral_code, name, dob} = studentInitDto;

        const student = new Student();
        student.name = name;
        student.dob = dob;

        const ancestor = await Agent.findOne({
            where: {
                referral_code: agent_referral_code.trim().toLowerCase()
            }
        });
        if (ancestor) {
            student.ancestor_id = ancestor.id;
            student.ancestry = `${ancestor.ancestry}${ancestor.id}/`;
        } else if (agent_referral_code) {
            throw new BadRequestException("Wrong Referral Code!")
        } else {
            student.ancestry = '/';
        }

        user.student = student
        user.is_admin = false
        await user.save();

        const payload: JwtPayload = {
            phone: user.phone,
            user_type: UserType.Student,
            initialized: true
        };
        const token = await this.jwtService.sign(payload);

        const signedInUser = user.toSignedInUser(UserType.Student, true);
        signedInUser.token = token
        return signedInUser;
    }

}
