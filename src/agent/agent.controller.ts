import {Body, Controller, Get, Post, Query, UseGuards, ValidationPipe} from "@nestjs/common";
import {GetUser} from "./get-user.decorator";
import {AgentService} from "./agent.service";
import {Agent} from "./agent.entity";
import {DepositDto} from "./dto/deposit.dto";
import {WithdrawDto} from "./dto/withdraw.dto";
import {agent} from "supertest";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {User} from "../auth/user.entity";
import {UserType} from "../auth/jwt-payload.interface";

@Controller("agent")
export class AgentController {

    constructor(private agentService: AgentService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get("details")
    getDetails(@GetUser() user: User) {
        return user.toSignedInUser(UserType.Agent, !!user.agent)
    }

    @UseGuards(JwtAuthGuard)
    @Get("unactivated-students")
    getUnactivatedStudents(@GetUser() agent: Agent) {
        return this.agentService.getUnactivatedStudents(agent);
    }

    @UseGuards(JwtAuthGuard)
    @Get("activated-students")
    getActivatedStudents(@GetUser() agent: Agent) {
        return this.agentService.getActivatedStudents(agent);
    }

    @UseGuards(JwtAuthGuard)
    @Get("paid-students")
    getPaidStudents(@GetUser() agent: User, @Query("downline_username") downlineUsername: string) {
        return this.agentService.getPaidStudents(agent, downlineUsername);
    }

    @UseGuards(JwtAuthGuard)
    @Post("deposit")
    deposit(@GetUser() agent: Agent, @Body(ValidationPipe) depositDto: DepositDto) {
        return this.agentService.deposit(agent, depositDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post("withdraw")
    withdraw(@GetUser() agent: User, @Body(ValidationPipe) withdrawDto: WithdrawDto) {
        return this.agentService.withdraw(agent, withdrawDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get("txns")
    getTxns(@GetUser() agent: Agent) {
        return this.agentService.getTxns(agent);
    }

    @UseGuards(JwtAuthGuard)
    @Post("activated-students")
    activateStudents(@GetUser() agent: Agent, @Body("usernames") usernames: string) {
        return this.agentService.activateStudents(agent, usernames);
    }

    @UseGuards(JwtAuthGuard)
    @Get("sub-agents")
    getSubOrdinateAgents(@GetUser() agent: User, @Query("downline_username") downlineUsername: string) {
        return this.agentService.getSubOrdinateAgents(agent, downlineUsername);
    }
}