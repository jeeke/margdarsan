import {Body, Controller, Get, Headers, Post, UseGuards, ValidationPipe} from '@nestjs/common';
import {PaymentService} from "./payment.service";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {GetAgent, GetStudent} from "../agent/get-user.decorator";
import {User} from "../entities/user.entity";
import {WithdrawDto} from "../agent/dto/withdraw.dto";

@Controller('api')
export class PaymentController {

    constructor(private paymentService: PaymentService) {
    }

    @Post("payment/events")
    paymentEvent(@Body() body, @Headers('x-razorpay-signature') signature) {
        return this.paymentService.handlePaymentEvent(body,signature)
    }

    @UseGuards(JwtAuthGuard)
    @Post("/agent/deposit/init")
    initDeposit(@GetAgent() user: User, @Body("amount") amount: number) {
        return this.paymentService.initializeDeposit(user, amount);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/agent/deposit/success")
    deposit(@GetAgent() user: User, @Body() paymentResponse) {
        return this.paymentService.onDepositSuccess(user, paymentResponse);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/agent/withdraw")
    withdraw(@GetAgent() agent: User, @Body(ValidationPipe) withdrawDto: WithdrawDto) {
        return this.paymentService.withdraw(agent, withdrawDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get("/agent/txns")
    getTxns(@GetAgent() user: User) {
        return this.paymentService.getAgentTxns(user);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/agent/activated-students")
    activateStudents(@GetAgent() agent: User, @Body("ids") ids: string) {
        return this.paymentService.activateStudents(agent, ids);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/student/subscription/init")
    initializePayment(@GetStudent() user: User) {
        return this.paymentService.initializeStudentSubscription(user);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/student/subscription/success")
    onPaymentDone(@GetStudent() user: User, @Body() paymentResponse) {
        return this.paymentService.onStudentPaymentDone(user, paymentResponse);
    }

}