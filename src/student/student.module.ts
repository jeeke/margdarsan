import { Module } from "@nestjs/common";
import { StudentController } from "./student.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentService } from "./student.service";
import { StudentRepository } from "./student.repository";
import { AgentRepository } from "../agent/agent.repository";


@Module({
  imports: [
    TypeOrmModule.forFeature([StudentRepository,AgentRepository]),
  ],
  controllers: [StudentController],
  providers: [StudentRepository, StudentService,AgentRepository],
  exports: [
    StudentRepository
  ]
})
export class StudentModule {
}
