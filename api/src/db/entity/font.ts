import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    OneToOne,
    JoinColumn,
} from "typeorm";

@Entity()
export class FontSource extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    /** 对应内部 OSS 中的 URL  */
    @Column()
    url!: string;

    /**  */
    @Column()
    isSplit!: boolean;
}

@Entity()
export class FontSplit extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @OneToOne(() => FontSource)
    @JoinColumn()
    source!: FontSource;

    /** 对应内部 OSS 中的切割文件成果文件夹的 URL  */
    @Column()
    folder!: string;
}
