import {
    Entity,
    Column,
    ManyToOne,
    OneToMany,
    Unique,
    JoinColumn,
} from "typeorm";
import { Record } from "./record.js";

/** web hook */
@Entity()
export class WebHook extends Record {
    /** 监听的 URL */
    @Column()
    @Unique("url_unique", ["url"])
    url!: string;

    @OneToMany((type) => WebHookLog, (webHookLog) => webHookLog.id, {
        onDelete: "CASCADE",
    })
    logs!: WebHookLog[];
}

export enum WebHookCBState {
    pending = 0,
    success = 1,
    error = 2,
}
export enum WebHookEvent {
    NULL = 0,
    /** 切割字体完成 */
    SPLIT_SUCCESS = 1,
    /** 用户上传字体成功 */
    UPLOAD_SUCCESS = 2,
}

/** WebHook 触发事件的存储 */
@Entity()
export class WebHookLog extends Record {
    @ManyToOne(() => WebHook, (source) => source.id)
    source!: WebHook;
    @Column({
        type: "enum",
        enum: WebHookCBState,
        default: WebHookCBState.pending,
    })
    state!: WebHookCBState;
    @Column({
        type: "enum",
        enum: WebHookEvent,
        default: WebHookEvent.NULL,
    })
    event!: WebHookEvent;
    @Column()
    message!: string;
}
