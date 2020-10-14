import {
  BaseEntity,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique
} from "typeorm";
import * as bcrypt from "bcryptjs";

@Entity()
@Unique(['username'])
export class Student extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  ancestor_id: number;

  @Column()
  ancestry: string;

  @Column({ nullable: true })
  salt: string;

  @Column({ nullable: true })
  paid_timestamp: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  grade: string;

  @Column({ nullable: true })
  school: string;

  @Column({ nullable: true })
  area: String;

  async validatePassword(password: string): Promise<boolean> {
    if (this.salt) {
      const hash = await bcrypt.hash(password, `${this.salt}`);
      return hash === this.password;
    } else return password === this.password;
  }
}
