import {BadRequestException, ConflictException, Injectable, InternalServerErrorException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import * as admin from "firebase-admin";
import {SignedInUser, User} from "./user.entity";
import {Agent} from "../agent/agent.entity";
import {AgentSignupDto} from "../agent/dto/agent-signup.dto";
import {getConnection} from "typeorm/index";
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
                username: null,
                user_type: loginDto.user_type,
                initialized: false,
                agent: null,
                student: null,
                name: null,
                token: null
            };
        }
        const payload: JwtPayload = {
            phone: r.phone,
            username: r.username,
            user_type: r.user_type,
            initialized: r.initialized
        };
        r.token = await this.jwtService.sign(payload);
        return r;
    }

    async agentSignup(user: User, agentSignUpDto: AgentSignupDto) {
        if (user.agent) throw new ConflictException("Already Signed Up!")

        const {username, name, agentCode} = agentSignUpDto;
        const agent = new Agent();
        user.username = username.toLowerCase();
        user.name = name;
        user.is_admin = false;

        agent.balance = 0;
        agent.level = 0;
        agent.sub_agents = 0;
        agent.paid_students = 0;

        const ancestor = await User.findOne({
            where: {
                username: agentCode
            }
        });
        if (ancestor && ancestor.agent) {
            agent.ancestor_id = ancestor.id;
            agent.ancestry = `${ancestor.agent.ancestry}${ancestor.id}/`;
            agent.height = ancestor.agent.height + 1;
            ancestor.agent.sub_agents = ancestor.agent.sub_agents + 1;
        } else throw new BadRequestException("Invalid Referral Code")
        //     {
        //     agent.ancestor_id = -1;
        //     agent.ancestry = '';
        //     agent.height = 1;
        // }

        await getConnection().transaction(async manager => {
            const userRepository = manager.getRepository<User>("user");

            user.agent = agent

            await userRepository.save(user);
            if (ancestor) await userRepository.save(ancestor);
        });

        const payload: JwtPayload = {
            phone: user.phone,
            username: user.username,
            user_type: UserType.Agent,
            initialized: true
        };
        const token = await this.jwtService.sign(payload);

        const signedInUser = user.toSignedInUser(UserType.Agent, true);
        signedInUser.token = token
        return signedInUser;

    }

    async initializeStudent(currentUser: User, studentInitDto: StudentInitializationDto) {
        const user = await User.findOne({
            where: {
                username: studentInitDto.username
            }
        })
        if (!user || !user.student || user.agent) throw new ConflictException("Please enter username provided by Margdarsan representative!")
        if (user.otp && user.otp.toString() !== studentInitDto.otp) throw new ConflictException("Invalid Otp!");
        user.otp = null;
        user.phone = currentUser.phone;
        user.name = studentInitDto.name;
        user.student.age_group = studentInitDto.age_group;
        user.student.interests = studentInitDto.interests;
        await user.save();

        const payload: JwtPayload = {
            phone: user.phone,
            username: user.username,
            user_type: UserType.Student,
            initialized: true
        };
        const token = await this.jwtService.sign(payload);

        const signedInUser = user.toSignedInUser(UserType.Student, true);
        signedInUser.token = token
        return signedInUser;
    }

    async generateStudentLogins(currentUser: User, prefix: string, count: number) {
        const newUsers = [];
        const passwords = this.generateOtps(count);
        for (let i = 0; i < count; i++) {
            const user = new User();
            user.is_admin = false;
            user.username = `${prefix.toLowerCase()}${i + 1}`;
            user.otp = passwords[i];
            const student = new Student();
            student.ancestor_id = currentUser.id;
            student.ancestry = `${currentUser.agent.ancestry}${currentUser.id}/`;
            user.student = student;
            newUsers.push(user);
        }
        try {
            return await User.save(newUsers);
        } catch (e) {
            if (e.code === "23505") throw new ConflictException("Please enter different prefix");
            else throw new InternalServerErrorException();
        }
    }

    generateOtp() {
        return Math.floor(100000 + Math.random() * 900000);
    }

    generateOtps(count: number) {
        const otps = [];
        for (let i = 0; i < count; i++) otps.push(this.generateOtp());
        return otps;
    }
}
