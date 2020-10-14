import { Body, Controller, Get, Post, UseGuards, ValidationPipe } from "@nestjs/common";
import { StudentService } from "./student.service";
import { StudentInitializationDto } from "./student-initialization.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { Student } from "./student.entity";
import { GetUser } from "../agent/get-user.decorator";

@Controller("student")
export class StudentController {
  constructor(private studentService: StudentService) {
  }

  @UseGuards(JwtAuthGuard)
  @Get("details")
  getDetails(@GetUser() student: Student) {
    return student;
  }

  @Post("login")
  login(@Body("username") username: string, @Body("password") password: string) {
    return this.studentService.login(username, password);
  }

  @Post("initialize")
  initializeStudent(@Body(ValidationPipe) studentInitDto: StudentInitializationDto) {
    return this.studentService.initializeStudent(studentInitDto);
  }

}