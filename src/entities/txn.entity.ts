import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {CreateDateColumn, JoinColumn, ManyToOne, OneToOne} from "typeorm/index";
import {User} from "./user.entity";

@Entity()
export class Transaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(type => User)
    @JoinColumn()
    user: User;

    @Column()
    amount: number;

    @CreateDateColumn()
    created_at: Date;

    @Column()
    txn_status: string;

    @Column({nullable: true})
    upi_id: string;

    @Column({nullable: true})
    order_id: string;

    @Column({nullable: true})
    payment_id: string;

    @Column({nullable: true})
    remark: string;

    @Column({nullable: true})
    fail_msg: string;

    @Column({nullable: true})
    razorpay_order: string
}