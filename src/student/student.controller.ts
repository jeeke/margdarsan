import {Body, Controller, Get, Post, Put, UseGuards} from "@nestjs/common";
import {StudentService} from "./student.service";
import {GetUser} from "../agent/get-user.decorator";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {User} from "../auth/user.entity";
import {UserType} from "../auth/jwt-payload.interface";

@Controller("api/student")
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

    @UseGuards(JwtAuthGuard)
    @Post("/payment/init")
    initializePayment(@GetUser() user: User) {
        return this.studentService.initializeSubscription(user);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/payment/success")
    onPaymentDone(@GetUser() user: User, @Body() paymentResponse) {
        return this.studentService.onPaymentDone(user, paymentResponse);
    }

    @UseGuards(JwtAuthGuard)
    @Post("/request-activation")
    requestActivation(@GetUser() user: User) {
        return this.studentService.requestActivation(user);
    }

    @UseGuards(JwtAuthGuard)
    @Put("/ancestor")
    updateAncestor(@GetUser() user: User, @Body("referral_code") referralCode: string) {
        return this.studentService.updateAncestor(user, referralCode);
    }


}