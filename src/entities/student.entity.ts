import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {JoinColumn, OneToOne} from "typeorm/index";
import {User} from "./user.entity";
import {Transaction} from "./txn.entity";

@Entity()
export class Student extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    dob: Date;

    @Column()
    category: string;

    @OneToOne(type => User, user => user.student)
    user: User;

    @Column({nullable: true})
    paid_at: Date;

    @Column({nullable: true})
    activation_requested: boolean;

    @OneToOne(type => Transaction, {
        cascade: true,
        eager: true
    })
    @JoinColumn()
    subscription_txn: Transaction;

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
