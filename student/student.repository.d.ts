import { Repository } from "typeorm";
import { ConflictException } from "@nestjs/common";
import { Student } from "./student.entity";
import { Agent } from "../agent/agent.entity";
import { StudentInitializationDto } from "./student-initialization.dto";
export declare class StudentRepository extends Repository<Student> {
    private logger;
    validateUserPassword(username: string, password: string): Promise<{
        initialized: boolean;
        username: string;
        ancestor_id: number;
        paid_timestamp: string;
        name: string;
        grade: string;
        school: string;
        area: String;
    }>;
    generateStudentLogins(agent: Agent, prefix: string, count: number): Promise<any[]>;
    getPaidStudents(agentId: number): Promise<Student[]>;
    getUnActivatedStudents(agentId: number): Promise<Student[]>;
    getActivatedStudents(agentId: number): Promise<Student[]>;
    updateDetails(studentInitDto: StudentInitializationDto): Promise<ConflictException | {
        username: string;
        ancestor_id: number;
        paid_timestamp: string;
        name: string;
        grade: string;
        school: string;
        area: String;
    }>;
}
