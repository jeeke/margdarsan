import {Controller, Get, Query, UseGuards} from "@nestjs/common";
import {GetAgent} from "../auth/get-user.decorator";
import {AgentService} from "./agent.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {User} from "../entities/user.entity";

@Controller("api/agent")
export class AgentController {

    constructor(private agentService: AgentService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get("details")
    getDetails(@GetAgent() user: User) {
        return this.agentService.getDetails(user);
    }

    @UseGuards(JwtAuthGuard)
    @Get("activation")
    getActivationRequests(@GetAgent() agent: User) {
        return this.agentService.getActivationRequests(agent);
    }

    @UseGuards(JwtAuthGuard)
    @Get("sub-agents")
    getSubOrdinateAgents(@GetAgent() agent: User, @Query("downline_user_id") downlineId: number) {
        return this.agentService.getSubOrdinateAgents(agent, downlineId);
    }
}
