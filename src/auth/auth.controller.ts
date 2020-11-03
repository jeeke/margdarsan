import {Body, Controller, Get, Post, UseGuards, ValidationPipe} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LoginDto} from "./dto/login.dto";
import {User} from "./user.entity";
import {AgentSignupDto} from "../agent/dto/agent-signup.dto";
import {JwtAuthGuard} from "./jwt-auth.guard";
import {GetUser} from "../agent/get-user.decorator";
import {StudentInitializationDto} from "./dto/student-initialization.dto";

@Controller('api/user')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post("login")
    login(@Body(ValidationPipe) loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/agent-signup")
    signUp(@GetUser() user: User, @Body(ValidationPipe) signupDto: AgentSignupDto) {
        return this.authService.initializeAgentProfile(user, signupDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/student-signup")
    initializeStudent(@GetUser() user: User, @Body(ValidationPipe) studentInitDto: StudentInitializationDto) {
        return this.authService.initializeStudentProfile(user, studentInitDto);
    }

    @Get("/agents")
    getAgents() {
        // return User.createQueryBuilder("user")
        //     .innerJoinAndSelect("user.agent", "user")
        //     .where({})
        //     .andWhere("agent.height = :height", {height: 0})
        //     .execute();
        return User.find({
            join: {
                alias: 'user',
                innerJoin: {
                    agent: 'user.agent'
                },
            },
            where: qb => {
                qb.where({

                }).andWhere('agent.height = :height', { height: 0 });
            }
        });
    }

}
