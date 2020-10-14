import { Repository, EntityRepository } from "typeorm";
import {
  ConflictException,
  InternalServerErrorException,
  Logger, UnauthorizedException
} from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { Student } from "./student.entity";
import * as generator from "generate-password";
import { Agent } from "../agent/agent.entity";
import { StudentInitializationDto } from "./student-initialization.dto";
import { IsNull, Not } from "typeorm/index";

@EntityRepository(Student)
export class StudentRepository extends Repository<Student> {
  private logger = new Logger("StudentRepository");

  async validateUserPassword(username: string, password: string) {
    const student = await Student.findOne({
      where: {
        username: username
      }
    });
    if (student && await student.validatePassword(password)) {
      const { id, password, ancestry, salt, ...result } = student;
      const initialized = salt != null;
      return { ...result, initialized };
    } else throw new UnauthorizedException("Invalid Credentials!");
  }

  async generateStudentLogins(agent: Agent, prefix: string, count: number) {
    const s = [];
    const passwords = await generator.generateMultiple(count, {
      length: 8,
      numbers: true
    });
    for (let i = 0; i < count; i++) {
      const student = new Student();
      student.username = `${prefix}${i + 1}`;
      student.password = passwords[i];
      student.ancestor_id = agent.id;
      student.ancestry = `${agent.ancestry}/${agent.id}`;
      s.push(student);
    }
    try {
      return await Student.save(s);
    } catch (e) {
      if (e.code === "23505") throw new ConflictException("Please enter different prefix");
      else throw new InternalServerErrorException();
    }
  }

  getPaidStudents(agentId: number) {
    return Student.find({
      where: {
        ancestor_id: agentId,
        paid_timestamp: Not(IsNull())
      },
      select: ["username", "name"]
    });
  }

  async getUnActivatedStudents(agentId: number) {
    return Student.find({
      where: {
        ancestor_id: agentId,
        paid_timestamp: IsNull(),
        salt: IsNull()
      },
      select: ["username", "password"]
    });
  }

  async getActivatedStudents(agentId: number) {
    return Student.find({
      where: {
        ancestor_id: agentId,
        paid_timestamp: IsNull(),
        salt: Not(IsNull())
      },
      select: ["username", "name"]
    });
  }

  async updateDetails(studentInitDto: StudentInitializationDto) {
    const student = await Student.findOne({
      where: {
        username: studentInitDto.username
      }
    });
    if (student && student.salt) return new ConflictException("Already Initialized");
    if (student && student.password === studentInitDto.password) {
      student.salt = await bcrypt.genSalt();
      student.password = await bcrypt.hash(studentInitDto.new_password, student.salt);
      student.name = studentInitDto.name;
      student.grade = studentInitDto.grade;
      student.school = studentInitDto.school;
      student.area = studentInitDto.area;
      await student.save();
      const { id, password, salt, ancestry, ...result } = student;
      return result;
    } else throw new UnauthorizedException("Invalid Credentials!");
  }
}
