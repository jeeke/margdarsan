import { StudentService } from "./student.service";
import { StudentInitializationDto } from "./student-initialization.dto";
import { Student } from "./student.entity";
export declare class StudentController {
    private studentService;
    constructor(studentService: StudentService);
    getDetails(student: Student): Student;
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
