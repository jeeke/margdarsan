import {BadRequestException, ConflictException, Injectable, InternalServerErrorException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import * as admin from "firebase-admin";
import {User} from "../entities/user.entity";
import {Agent} from "../entities/agent.entity";
import {AgentSignupDto} from "../agent/dto/agent-signup.dto";
import {JwtPayload, UserType} from "./jwt-payload.interface";
import {LoginDto} from "./dto/login.dto";
import {StudentInitializationDto} from "./dto/student-initialization.dto";
import {Student} from "../entities/student.entity";
import {Tag} from "../entities/tag.entity";

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
        let r;
        if (user) {
            r = user.toSignedInUser(loginDto.user_type, true)
        } else {
            const categories = ["6th", "7th", "8th", "9th", "10th", "11th", "12th", "Undergraduate"]
            r = {
                phone: decodedIdToken.phone_number,
                user_type: loginDto.user_type,
                initialized: false,
                agent: null,
                student: null,
                token: null
            };
            if (loginDto.user_type === UserType.Student) r.categories = categories
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
        user.user_type = UserType.Agent;

        agent.balance = 0;
        agent.level = 0;
        agent.sub_agents = 0;
        agent.paid_students = 0;

        if (agent_referral_code) {
            const ancestor = await Agent.findOne({
                where: {
                    referral_code: agent_referral_code.trim().toLowerCase()
                },
                relations: ["user"],
            });
            if (ancestor) {
                user.ancestor_id = ancestor.id;
                user.ancestry = `${ancestor.user.ancestry}${ancestor.id}/`;
                user.height = ancestor.user.height + 1;
            } else throw new BadRequestException("Wrong Referral Code!")
        } else {
            user.ancestry = '/';
            user.height = 0;
        }
        try {
            user.agent = agent
            await user.save();
        } catch (e) {
            if (e.code === "23505") {
                // duplicate username
                throw new ConflictException("Username already exists");
            } else {
                throw new InternalServerErrorException();
            }
        }

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
        const {agent_referral_code, name, dob, category} = studentInitDto;

        const student = new Student();
        student.name = name;
        student.dob = new Date(Number(dob));
        student.category = category
        student.tags = await Tag.find({
            where: {
                name: 'universal'
            }
        })

        if (agent_referral_code) {
            const ancestor = await Agent.findOne({
                where: {
                    referral_code: agent_referral_code.trim().toLowerCase()
                },
                relations: ["user"]
            });
            if (ancestor) {
                user.ancestor_id = ancestor.id;
                user.ancestry = `${ancestor.user.ancestry}${ancestor.id}/`;
            } else if (agent_referral_code) {
                throw new BadRequestException("Wrong Referral Code!")
            }
        } else {
            user.ancestry = '/';
        }

        user.student = student
        user.user_type = UserType.Student
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
