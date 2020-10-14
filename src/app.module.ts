import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { AgentModule } from './agent/agent.module';
import { StudentService } from './student/student.service';
import { StudentModule } from './student/student.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AgentModule, StudentModule],
  controllers: [AppController],
  providers: [AppService, StudentService],
})
export class AppModule {}
