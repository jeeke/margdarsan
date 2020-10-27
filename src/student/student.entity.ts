import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {OneToOne, Timestamp} from "typeorm/index";
import {User} from "../auth/user.entity";

@Entity()
export class Student extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(type => User, user => user.student)
    user: User;

    @Column({nullable: true})
    paid_at: Date;

    @Column({nullable: true})
    age_group: string;

    @Column({nullable: true})
    interests: string;

    @Column()
    ancestor_id: number;

    @Column()
    ancestry: string;

    toSignedInStudent(): SignedInStudent {
        return {
            age_group: this.age_group,
            interests: this.interests,
            paid_at: this.paid_at
        }
    }
}

export interface SignedInStudent {
    age_group: string,
    interests: string,
    paid_at: Date
}
