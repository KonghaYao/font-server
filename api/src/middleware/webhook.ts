import { Middleware } from "koa";
import { WebHookRepo } from "../db/db.js";
import {
    WebHookCBState,
    WebHookEvent,
    WebHookLog,
} from "../db/entity/webhook.js";

declare module "koa" {
    interface Response {
        webhook?: {
            event: WebHookEvent;
            payload: any;
        };
    }
}

/** 发布 WebHook 事件 */
export const webhook = (): Middleware => {
    return async (ctx, next) => {
        await next();
        if (!ctx.response.webhook) return;
        const hookMessage = ctx.response.webhook;
        // 副作用，不用考虑等待问题
        WebHookRepo.find().then((hooks) => {
            hooks.forEach(async (i) => {
                const log = WebHookLog.create({
                    source: i,
                    state: WebHookCBState.pending,
                    message: "",
                    event: hookMessage!.event,
                });
                await log.save();

                const fetch: (typeof globalThis)["fetch"] = (globalThis as any)
                    ._fetch;
                return fetch(i.url, {
                    method: "post",
                    headers: {
                        "content-type": "application/json",
                        "x-font-server": "",
                    },
                    body: JSON.stringify(hookMessage),
                })
                    .then((res) => res.json())
                    .then((res: any) => {
                        log.message = res.message;
                        log.state = WebHookCBState.success;
                        return log.save();
                    })
                    .catch((e: Error) => {
                        log.message = e.toString();
                        log.state = WebHookCBState.success;
                        return log.save();
                    });
            });
        });
    };
};
