import {Body, Controller, Post, UseGuards, ValidationPipe} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LoginDto} from "./dto/login.dto";
import {User} from "./user.entity";
import {AgentSignupDto} from "../agent/dto/agent-signup.dto";
import {JwtAuthGuard} from "./jwt-auth.guard";
import {GetUser} from "../agent/get-user.decorator";
import {StudentInitializationDto} from "./dto/student-initialization.dto";

@Controller('user')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post("login")
    login(@Body(ValidationPipe) loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post("student-logins")
    generateStudentLogins(@GetUser() agent: User, @Body("prefix") prefix: string, @Body("count") count: number) {
        return this.authService.generateStudentLogins(agent, prefix, count);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/agent-signup")
    signUp(@GetUser() user: User, @Body(ValidationPipe) signupDto: AgentSignupDto) {
        return this.authService.agentSignup(user, signupDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/student-signup")
    initializeStudent(@GetUser() user: User, @Body(ValidationPipe) studentInitDto: StudentInitializationDto) {
        return this.authService.initializeStudent(user, studentInitDto);
    }
}
