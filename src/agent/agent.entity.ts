import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique
} from "typeorm";
import { PrimaryColumn } from "typeorm/index";

@Entity()
@Unique(["username","phone"])
export class Agent extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  phone: string;

  @Column()
  name: string;

  @Column()
  balance: number;

  @Column()
  level: number;

  @Column()
  height: number;

  @Column({ nullable: true })
  sub_agents: number;

  @Column({ nullable: true })
  paid_students: number;

  @Column()
  ancestor_id: number;

  @Column()
  ancestry: string;

}
