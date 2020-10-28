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

    async getDarshikas(user: User) {
        const t = user.student.paid_at.getTime()
        const begin = new Date(t);
        const end = new Date(t);
        end.setFullYear(end.getFullYear() + 1);
        if (!begin || !end) throw new ConflictException("Subscription not active");
        return await Darshika.find({
            where: {
                created_at: Between(begin, end)
            }
        });
    }
}