import {EntityRepository, Repository} from "typeorm";
import {Logger} from "@nestjs/common";
import {Student} from "./student.entity";
import {IsNull, Not} from "typeorm/index";

@EntityRepository(Student)
export class StudentRepository extends Repository<Student> {
    private logger = new Logger("StudentRepository");

    async getPaidStudents(agentId: number) {
        const s = await Student.find({
            where: {
                ancestor_id: agentId,
                paid_at: Not(IsNull()),
            },
            relations: ["user"],
            select: ["id"],
        });
        return s.map(student => {
            return {
                username: student.user.username,
                name: student.user.name,
                student: {
                    id: student.id
                }
            }
        })
    }

    async getUnActivatedStudents(agentId: number) {
        const s = await Student.find({
            where: {
                ancestor_id: agentId,
                paid_at: IsNull(),
                age_group: IsNull(),
                // salt: IsNull()
            },
            relations: ["user"],
            select: ["id"],
        });
        return s.map(student => {
            return {
                username: student.user.username,
                otp: student.user.otp,
                student: {
                    id: student.id
                }
            }
        })
    }

    async getActivatedStudents(agentId: number) {
        const s = await Student.find({
            where: {
                ancestor_id: agentId,
                paid_at: IsNull(),
                age_group: Not(IsNull()),
            },
            relations: ["user"],
            select: ["id"]
        });
        return s.map(student => {
            return {
                username: student.user.username,
                name: student.user.name,
                student: {
                    id: student.id
                }
            }
        })
    }

}
