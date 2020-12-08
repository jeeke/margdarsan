import {
    BaseEntity,
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn
} from "typeorm/index";
import {Tag} from "./tag.entity";

@Entity()
@Unique(["serial_no"])
export class Darshika extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    link: string;

    @Column({nullable: true})
    image: string;

    @Column({nullable: true})
    attachment_link: string;

    @Column()
    serial_no: number;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToMany(type => Tag, t => t.darshikas, {
        eager: true,
        cascade: true
    })
    @JoinTable()
    tags: Tag[]
}
