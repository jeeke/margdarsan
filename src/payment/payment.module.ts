import {Module} from '@nestjs/common';
import {PaymentService} from './payment.service';
import {PaymentController} from './payment.controller';
import {TxnRepository} from "../agent/txn.repository";
import {StudentService} from "../student/student.service";
import {StudentModule} from "../student/student.module";

@Module({
    imports: [TxnRepository, StudentModule],
    providers: [PaymentService, TxnRepository, StudentService],
    controllers: [PaymentController]
})
export class PaymentModule {
}
