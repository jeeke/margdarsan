import {EntityRepository, Repository} from "typeorm";
import {Logger} from "@nestjs/common";
import {Student} from "../entities/student.entity";
import {User} from "../entities/user.entity";

@EntityRepository(Student)
export class StudentRepository extends Repository<Student> {
    private logger = new Logger("StudentRepository");

    async getActivationRequests(userId: number) {
        return User.createQueryBuilder("user")
            .innerJoinAndSelect(
                "user.student",
                "student",
                "student.paid_at IS NULL AND student.activation_requested = :y",
                {y: true}
            ).select(["student.id","user.phone","student.name"])
            .where({
                ancestor_id: userId
            }).getMany();
    }

}
