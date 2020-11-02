import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {OneToOne} from "typeorm/index";
import {User} from "../auth/user.entity";

@Entity()
export class Student extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    dob: string;

    @OneToOne(type => User, user => user.student)
    user: User;

    @Column({nullable: true})
    paid_at: Date;

    @Column({nullable: true})
    activation_requested: boolean;

    @Column({nullable: true})
    ancestor_id: number;

    @Column()
    ancestry: string;

    @Column({nullable: true})
    razorpay_order_id: string;

    toSignedInStudent(): SignedInStudent {
        return {
            name: this.name,
            paid_at: this.paid_at
        }
    }
}

export interface SignedInStudent {
    name: string,
    paid_at: Date
}
