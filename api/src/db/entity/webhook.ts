import { Entity, Column, ManyToOne, OneToMany, Unique } from "typeorm";
import { Record } from "./record.js";

/** web hook */
@Entity()
export class WebHook extends Record {
    /** 监听的 URL */
    @Column()
    url!: string;
}

export enum WebHookCBState {
    pending = 0,
    success = 1,
    error = 2,
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
    @Column()
    message!: string;
}
