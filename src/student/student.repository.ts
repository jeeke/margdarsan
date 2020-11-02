import {EntityRepository, Repository} from "typeorm";
import {Logger} from "@nestjs/common";
import {Student} from "./student.entity";
import {IsNull} from "typeorm/index";

@EntityRepository(Student)
export class StudentRepository extends Repository<Student> {
    private logger = new Logger("StudentRepository");

    async getActivationRequests(agentId: number) {
        const r = await Student.find({
            where: {
                ancestor_id: agentId,
                paid_at: IsNull(),
                activation_requested: true
            },
            select: ["id", "name"],
            relations: ["user"]
        });
        return r.map(s => {
            return {
                phone: s.user.phone,
                student: {
                    id: s.id,
                    name: s.name
                }
            }
        })
    }

}
