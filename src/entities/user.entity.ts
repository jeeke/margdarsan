import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique} from "typeorm/index";
import {SignedInStudent, Student} from "./student.entity";
import {Agent, SignedInAgent} from "./agent.entity";
import {ConflictException} from "@nestjs/common";
import {UserType} from "../auth/jwt-payload.interface";

@Entity()
@Unique(["phone"])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    phone: string;

    @Column({nullable: true})
    admin_password: string;

    @Column({nullable: true})
    user_type: string;

    @Column({nullable: true})
    ancestor_id: number;

    @Column({nullable: true})
    ancestry: string;

    @Column({nullable: true})
    height: number;

    @OneToOne(type => Agent, {
        eager: true,
        cascade: true
    })
    @JoinColumn()
    agent?: Agent;

    @OneToOne(type => Student, {
        eager: true,
        cascade: true
    })
    @JoinColumn()
    student?: Student;

    toSignedInUser(requestedUserType: string, initialized: boolean): SignedInUser {
        if (this.user_type != requestedUserType && this.user_type != UserType.Admin) {
            throw new ConflictException(`Please Login as ${this.user_type}!`);
        }
        return {
            phone: this.phone,
            user_type: this.user_type,
            agent: this.agent,
            student: this.student,
            token: null,
            initialized,
        }
    }

}

export interface SignedInUser {
    phone: string,
    user_type: string,
    initialized: boolean,
    agent: SignedInAgent,
    student: SignedInStudent,
    token: string
}
