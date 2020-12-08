import {BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn} from "typeorm/index";
import {Student} from "./student.entity";
import {Darshika} from "./darshika.entity";

@Entity()
export class Tag extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    tag: string;

    @ManyToMany(type => Student, s => s.tags)
    students: Student[]

    @ManyToMany(type => Darshika, d => d.tags)
    darshikas: Darshika[]
}
