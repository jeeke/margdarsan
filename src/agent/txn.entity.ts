import {BaseEntity, Column, Entity, PrimaryGeneratedColumn} from "typeorm";

export const TxnStatus = {
    Processing: "Processing",
    Declined: "Failed",
    Successful: "Successful"
}

@Entity()
export class Transaction extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    amount: number;

    @Column()
    txn_time: string;

    @Column()
    txn_status: string;

    @Column({nullable: true})
    upi_id: string;

    @Column({nullable: true})
    txn_code: string;

    @Column({nullable: true})
    remark: string;

    @Column({nullable: true})
    decline_msg: string;

}