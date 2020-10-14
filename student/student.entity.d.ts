import { BaseEntity } from "typeorm";
export declare class Student extends BaseEntity {
    id: number;
    username: string;
    password: string;
    ancestor_id: number;
    ancestry: string;
    salt: string;
    paid_timestamp: string;
    name: string;
    grade: string;
    school: string;
    area: String;
    validatePassword(password: string): Promise<boolean>;
}
