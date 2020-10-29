import { Module } from "@nestjs/common";
import { AgentController } from "./agent.controller";
import { AgentService } from "./agent.service";
import { AgentRepository } from "./agent.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentModule } from "../student/student.module";
import { TxnRepository } from "./txn.repository";
import { StudentRepository } from "../student/student.repository";

@Module({
  imports: [TypeOrmModule.forFeature([AgentRepository]), StudentModule],
  controllers: [AgentController],
  providers: [AgentService, AgentRepository, TxnRepository, StudentRepository]
})
export class AgentModule {
}