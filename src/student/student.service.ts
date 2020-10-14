import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { StudentRepository } from "./student.repository";
import { JwtPayload, UserType } from "./jwt-payload.interface";
import { JwtService } from "@nestjs/jwt";
import { StudentInitializationDto } from "./student-initialization.dto";

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(StudentRepository)
    private repository: StudentRepository,
    private jwtService: JwtService
  ) {
  }

  private logger = new Logger("StudentService");

  async login(username: string, password: string) {
    const user = await this.repository.validateUserPassword(username, password);
    const loggedInUsername = user.username;
    const payload: JwtPayload = { username: loggedInUsername, phone: null, user_type: UserType.Student };
    const token = await this.jwtService.sign(payload);
    this.logger.debug(
      `Generated JWT Token with payload ${JSON.stringify(payload)}`
    );
    return { ...user, token };
  }

  initializeStudent(studentInitDto: StudentInitializationDto) {
    return this.repository.updateDetails(studentInitDto);
  }
}