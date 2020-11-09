import {BaseEntity, Column, Entity, PrimaryGeneratedColumn, Unique, UpdateDateColumn} from "typeorm/index";

@Entity()
@Unique(["serial_no"])
export class Darshika extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    link: string;

    @Column()
    serial_no: number;

    @UpdateDateColumn()
    updated_at: Date;
}