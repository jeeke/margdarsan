import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {typeOrmConfig} from './config/typeorm.config';
import {AgentModule} from './agent/agent.module';
import {StudentService} from './student/student.service';
import {StudentModule} from './student/student.module';
import {AuthService} from './auth/auth.service';
import {AuthModule} from "./auth/auth.module";
import {ServeStaticModule} from "@nestjs/serve-static";
import { join } from 'path';
import { PaymentModule } from './payment/payment.module';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
            exclude: ['/api*'],
        }),
        TypeOrmModule.forRoot(typeOrmConfig),
        AgentModule,
        StudentModule,
        AuthModule,
        PaymentModule
    ],
    controllers: [AppController],
    providers: [StudentService, AuthService],
})
export class AppModule {
}
