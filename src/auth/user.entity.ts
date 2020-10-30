import {BaseEntity, Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Unique} from "typeorm/index";
import {SignedInStudent, Student} from "../student/student.entity";
import {Agent, SignedInAgent} from "../agent/agent.entity";
import {UserType} from "./jwt-payload.interface";
import {ConflictException} from "@nestjs/common";

@Entity()
@Unique(["username", "phone"])
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column({nullable: true})
    phone: string;

    @Column({nullable: true})
    name: string;

    @Column({nullable: true})
    otp: string;

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

    @Column({nullable: true})
    is_admin: boolean;

    toSignedInUser(userType: string, initialized: boolean): SignedInUser {
        let a = null, s = null;
        if (userType === UserType.Agent && this.student) {
            throw new ConflictException("Please Login as Student!");
        }
        if (userType === UserType.Student && this.agent) {
            throw new ConflictException("Please Login as Agent!");
        }
        if (userType === UserType.Agent) {
            a = this.agent.toSignedInAgent();
            s = null
        } else if (userType === UserType.Student) {
            s = this.student.toSignedInStudent();
            a = null;
        }
        return {
            username: this.username,
            name: this.name,
            phone: this.phone,
            user_type: userType,
            initialized: initialized,
            agent: a,
            student: s,
            token: null
        }
    }

}

export interface SignedInUser {
    username: string,
    name: string
    phone: string,
    user_type: string,
    initialized: boolean,
    agent: SignedInAgent,
    student: SignedInStudent,
    token: string
}
