import { StudentRepository } from "./student.repository";
import { JwtService } from "@nestjs/jwt";
import { StudentInitializationDto } from "./student-initialization.dto";
export declare class StudentService {
    private repository;
    private jwtService;
    constructor(repository: StudentRepository, jwtService: JwtService);
    private logger;
    login(username: string, password: string): Promise<{
        token: string;
        initialized: boolean;
        username: string;
        ancestor_id: number;
        paid_timestamp: string;
        name: string;
        grade: string;
        school: string;
        area: String;
    }>;
    initializeStudent(studentInitDto: StudentInitializationDto): Promise<import("@nestjs/common").ConflictException | {
        username: string;
        ancestor_id: number;
        paid_timestamp: string;
        name: string;
        grade: string;
        school: string;
        area: String;
    }>;
}
