import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AgentModule } from './agent/agent.module';
import { StudentService } from './student/student.service';
import { StudentModule } from './student/student.module';
import { AuthService } from './auth/auth.service';
import {AuthModule} from "./auth/auth.module";

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AgentModule, StudentModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, StudentService, AuthService],
})
export class AppModule {}
