import { Module } from "@nestjs/common";
import { StudentController } from "./student.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StudentService } from "./student.service";
import { StudentRepository } from "./student.repository";
import { PassportModule } from "@nestjs/passport";
import { JwtModule, JwtService } from "@nestjs/jwt";
import * as config from "config";
import { JwtStrategy } from "./jwt.strategy";
import { AgentRepository } from "../agent/agent.repository";

const jwtConfig = config.get("jwt");

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || jwtConfig.secret,
      signOptions: {
        expiresIn: jwtConfig.expiresIn
      }
    }),
    TypeOrmModule.forFeature([StudentRepository,AgentRepository]),
  ],
  controllers: [StudentController],
  providers: [StudentRepository, StudentService, JwtStrategy,AgentRepository],
  exports: [
    StudentRepository,
    JwtModule
  ]
})
export class StudentModule {
}
