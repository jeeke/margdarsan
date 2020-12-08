import {BadRequestException, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {StudentRepository} from "./student.repository";
import {User} from "../entities/user.entity";
import {In} from "typeorm/index";
import {Agent} from "../entities/agent.entity";
import {Tag} from "../entities/tag.entity";

@Injectable()
export class StudentService {
    constructor(
        @InjectRepository(StudentRepository)
        private repository: StudentRepository
    ) {
    }

    private logger = new Logger("StudentService");

    async getDarshikasNSubscription(user: User) {
        const darshikas = await this.getMyDarshikas(user)
        return {...await this.getSubscription(user), darshikas}
    }

    async getMyDarshikas(user: User) {
        const tagArray = user.student.tags.map(T => T.tag)
        const tags = await Tag.find({
            relations: ["darshikas"],
            where: {
                tag: In(tagArray)
            }
        })
        const ds = {}
        tags.forEach(t => t.darshikas.forEach(d => {
            delete d.tags
            ds[d.id] = d
        }))
        return Object.values(ds)
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
            if (a && !(a.referral_code === "margdarsan")) {
                ancestor = {
                    id: a.id,
                    name: a.name,
                    referral_code: a.referral_code
                }
            }
            return {
                subscribed: false,
                ancestor,
                activation_requested: user.student.activation_requested
            }
        }
        const t = paid_at.getTime()
        const begin = new Date(t);
        const expiry = new Date(t);
        const currentDate = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(paid_at.getDate() + 15);
        expiry.setFullYear(expiry.getFullYear() + 1);
        return {
            subscribed: !!paid_at && (begin < currentDate) && (expiry > currentDate),
            paid_at: new Date(t),
            expiry
        }
    }

}
