import {ConflictException, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {StudentRepository} from "./student.repository";
import {User} from "../auth/user.entity";
import {Darshika} from "./darshika.entity";
import {Between} from "typeorm/index";

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(StudentRepository)
        private repository: StudentRepository
    ) {
    }

    private logger = new Logger("StudentService");

    // initializeStudent(studentInitDto: StudentInitializationDto) {
    //   return this.repository.updateDetails(studentInitDto);
    // }

    getDarshikas(user: User) {
        const begin = user.student.paid_at;
        if (!begin) throw new ConflictException("Subscription not active");
        const end = user.student.paid_at;
        end.setFullYear(end.getFullYear() + 1);
        return Darshika.find({
            where: {
                created_at: Between(begin, end)
            },
            select: ["title", "link", "created_at"]
        })
    }
}