import {Controller, Post, UseGuards} from '@nestjs/common';
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@Controller('api/payment')
export class PaymentController {

    @UseGuards(JwtAuthGuard)
    @Post("events")
    paymentEvent() {
        return;
    }
}