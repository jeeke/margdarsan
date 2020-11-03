import {Body, Controller, Logger, Post} from '@nestjs/common';

@Controller('api/payment')
export class PaymentController {

    private logger = new Logger("StudentService");

    @Post("events")
    paymentEvent(@Body() payload) {
        this.logger.debug(payload);
        return;
    }

}