import {Controller, Get, UseGuards} from "@nestjs/common";
import {StudentService} from "./student.service";
import {GetUser} from "../agent/get-user.decorator";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {User} from "../auth/user.entity";
import {UserType} from "../auth/jwt-payload.interface";

@Controller("student")
export class StudentController {
    constructor(private studentService: StudentService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get("details")
    getDetails(@GetUser() user: User) {
        return user.toSignedInUser(UserType.Student, true);
    }

    @UseGuards(JwtAuthGuard)
    @Get("darshika")
    getDarshikas(@GetUser() user: User) {
        return this.studentService.getDarshikas(user);
    }

}