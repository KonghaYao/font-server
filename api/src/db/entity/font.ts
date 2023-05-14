import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Unique,
} from "typeorm";
import { Record } from "./record.js";

/** 字体原始文件存储 */
@Entity()
export class FontSource extends Record {
    /** 对应内部 OSS 中的 URL  */
    @Column()
    path!: string;

    @Column()
    name!: string;

    @Column()
    @Unique("user_fonts_unique", ["md5"])
    md5!: string;

    // 一个字体包含多个切割版本
    @OneToMany(() => FontSplit, (sp) => sp.source)
    versions!: FontSplit[];

    /**  */
    @Column()
    isSplit!: boolean;
}

/** 切割字体的存储 */
@Entity()
export class FontSplit extends Record {
    @ManyToOne(() => FontSource, (source) => source.versions)
    @JoinColumn({ name: "user_id" })
    source!: FontSource;

    /** 对应内部 OSS 中的切割文件成果文件夹的 URL  */
    @Column()
    folder!: string;
}
