import {BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";
import {OneToOne} from "typeorm/index";
import {User} from "../auth/user.entity";

@Entity()
@Unique(["referral_code"])
export class Agent extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    referral_code: string;

    @Column({nullable: true})
    address: string;

    @Column()
    name: string;

    @OneToOne(type => User, user => user.agent)
    user: User;

    @Column()
    balance: number;

    @Column()
    level: number;

    @Column()
    height: number;

    sub_agents: number;

    paid_students: number;

    toSignedInAgent(): SignedInAgent {
        return {
            name: this.name,
            balance: this.balance,
            level: this.level,
            sub_agents: this.sub_agents,
            paid_students: this.paid_students,
            referral_code: this.referral_code
        }
    }
}

export interface SignedInAgent {
    name: string,
    balance: number,
    level: number,
    sub_agents: number,
    paid_students: number,
    referral_code: string
}
