import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique
} from "typeorm";

export enum TxnStatus {
  Processing,
  Declined,
  Successful
}

@Entity()
export class Transaction extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  agent_id: number;

  @Column()
  amount: number;

  @Column()
  txn_time: string;

  @Column()
  txn_code: string;

  @Column({nullable: true})
  txn_status: TxnStatus;

  @Column({ nullable: true })
  remark: string;

  @Column({ nullable: true })
  decline_msg: string;

}