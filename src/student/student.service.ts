import {BadRequestException, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {StudentRepository} from "./student.repository";
import {User} from "../entities/user.entity";
import {Darshika} from "../entities/darshika.entity";
import {LessThanOrEqual} from "typeorm/index";
import {Agent} from "../entities/agent.entity";

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(StudentRepository)
        private repository: StudentRepository
    ) {
    }

    private logger = new Logger("StudentService");

    async getDarshikas(user: User) {
        const sub = await this.getSubscription(user)
        if (!sub.subscribed) return sub;

        sub.darshikas = await this.getMyDarshikas(user.student.paid_at);
        return sub;
    }

    async getMyDarshikas(paid_at: Date) {
        return await Darshika.find({
            where: {
                serial_no: LessThanOrEqual(this.lastDarshikaNumber(paid_at) + 1)
            },
            order: {
                serial_no: "DESC"
            }
        });
    }

    async updateAncestor(user: User, referralCode: string) {
        const ancestor = await Agent.findOne({
            where: {
                referral_code: referralCode
            },
            relations: ["user"]
        });
        if (!ancestor) throw new BadRequestException('Wrong Referral Code!')
        user.ancestor_id = ancestor.id
        user.ancestry = `${ancestor.user.ancestry}${ancestor.id}/`;
        await user.save();
        return {
            id: ancestor.id,
            referral_code: ancestor.referral_code,
            name: ancestor.name
        }
    }

    async requestActivation(user: User) {
        user.student.activation_requested = true;
        await user.student.save();
    }

    // -------------------------------Utilities--------------------------

    async getSubscription(user: User) {
        const paid_at = user.student.paid_at
        if (!paid_at) {
            const a = await Agent.findOne({
                where: {
                    id: user.ancestor_id
                },
            });
            let ancestor = null
            if (a) {
                ancestor = {
                    id: a.id,
                    name: a.name,
                    referral_code: a.referral_code
                }
            }
            return {
                subscribed: false,
                darshikas: await Darshika.find({
                    where: {
                        serial_no: 0
                    }
                }),
                ancestor,
                activation_requested: user.student.activation_requested
            }
        }
        const t = paid_at.getTime()
        const begin = new Date(t);
        const expiry = new Date(t);
        const currentDate = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(new Date().getDate() + 1);
        expiry.setFullYear(expiry.getFullYear() + 1);
        return {
            subscribed: !!paid_at && (begin < currentDate) && (expiry > currentDate),
            paid_at: new Date(t),
            expiry,
            next_darshika: tomorrow,
            darshikas: [],
        }
    }

    lastDarshikaNumber(paid_at: Date) {
        const now = new Date()
        let months;
        months = (now.getFullYear() - paid_at.getFullYear()) * 12;
        months -= paid_at.getMonth();
        months += now.getMonth();
        months = months > 12 ? 12 : months
        return months <= 0 ? 0 : months;
    }

}