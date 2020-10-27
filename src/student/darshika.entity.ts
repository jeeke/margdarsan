import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Timestamp} from "typeorm/index";

@Entity()
export class Darshika extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    link: string;

    @CreateDateColumn()
    created_at: Date;
}