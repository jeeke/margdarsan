import {Body, Controller, Get, Post, Put, UseGuards} from "@nestjs/common";
import {StudentService} from "./student.service";
import {GetStudent} from "../agent/get-user.decorator";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {User} from "../entities/user.entity";
import {UserType} from "../auth/jwt-payload.interface";

@Controller("api/student")
export class StudentController {
    constructor(private studentService: StudentService) {
    }

    @UseGuards(JwtAuthGuard)
    @Get("details")
    getDetails(@GetStudent() user: User) {
        return user.toSignedInUser(UserType.Student, true);
    }

    @UseGuards(JwtAuthGuard)
    @Get("darshika")
    getDarshikas(@GetStudent() user: User) {
        return this.studentService.getDarshikas(user);
    }

    @UseGuards(JwtAuthGuard)
    @Post("activation")
    requestActivation(@GetStudent() user: User) {
        return this.studentService.requestActivation(user);
    }

    @UseGuards(JwtAuthGuard)
    @Put("ancestor")
    updateAncestor(@GetStudent() user: User, @Body("referral_code") referralCode: string) {
        return this.studentService.updateAncestor(user, referralCode);
    }


}