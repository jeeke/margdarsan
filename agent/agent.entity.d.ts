import { BaseEntity } from "typeorm";
export declare class Agent extends BaseEntity {
    id: number;
    username: string;
    phone: string;
    name: string;
    balance: number;
    level: number;
    height: number;
    sub_agents: number;
    paid_students: number;
    ancestor_id: number;
    ancestry: string;
}
