import {Body, Controller, Get, Post, Query, UseGuards, ValidationPipe} from "@nestjs/common";
import {GetUser} from "./get-user.decorator";
import {AgentService} from "./agent.service";
import {WithdrawDto} from "./dto/withdraw.dto";
import {agent} from "supertest";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {User} from "../auth/user.entity";

@Controller("agent")
export class AgentController {

    constructor(private agentService: AgentService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get("details")
    getDetails(@GetUser() user: User) {
        return this.agentService.getDetails(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get("activation-requests")
    getActivationRequests(@GetUser() agent: User) {
        return this.agentService.getActivationRequests(agent);
    }

    @UseGuards(JwtAuthGuard)
    @Post("deposit/init")
    initDeposit(@GetUser() user: User, @Body("amount") amount: number) {
        return this.agentService.initializeDeposit(user, amount);
    }

    @UseGuards(JwtAuthGuard)
    @Post("deposit/success")
    deposit(@GetUser() user: User, @Body() paymentResponse) {
        return this.agentService.onDepositSuccess(user,paymentResponse);
    }

    @UseGuards(JwtAuthGuard)
    @Post("withdraw")
    withdraw(@GetUser() agent: User, @Body(ValidationPipe) withdrawDto: WithdrawDto) {
        return this.agentService.withdraw(agent, withdrawDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get("txns")
    getTxns(@GetUser() agent: User) {
        return this.agentService.getTxns(agent);
    }

    @UseGuards(JwtAuthGuard)
    @Post("activated-students")
    activateStudents(@GetUser() agent: User, @Body("ids") ids: string) {
        return this.agentService.activateStudents(agent, ids);
    }

    @UseGuards(JwtAuthGuard)
    @Get("sub-agents")
    getSubOrdinateAgents(@GetUser() agent: User, @Query("downline_agent_id") downlineAgentId: number) {
        return this.agentService.getSubOrdinateAgents(agent, downlineAgentId);
    }
}