import {BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique} from "typeorm";
import {OneToOne} from "typeorm/index";
import {User} from "../auth/user.entity";

@Entity()
export class Agent extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

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

    @Column()
    ancestor_id: number;

    @Column()
    ancestry: string;

    toSignedInAgent(): SignedInAgent {
        return {
            balance: this.balance,
            level: this.level,
            sub_agents: this.sub_agents,
            paid_students: this.paid_students
        }
    }
}

export interface SignedInAgent {
    balance: number,
    level: number,
    sub_agents: number,
    paid_students: number
}
