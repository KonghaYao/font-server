import Router from "@koa/router";
import { WebHookRepo } from "../db/db.js";
import { webhook } from "../middleware/webhook.js";
import { WebHookEvent, WebHookLog } from "../db/entity/webhook.js";
const WebHookRouter = new Router();

/** 添加一个事件订阅 */
WebHookRouter.post("/webhook", async (ctx) => {
    const url = ctx.request.body.url;
    if (url) {
        ctx.body = JSON.stringify(
            await WebHookRepo.create({
                url,
            }).save()
        );
    } else {
        ctx.body = JSON.stringify({ error: "没有输入 url" });
    }
});
/** 删除一个事件订阅 */
WebHookRouter.delete("/webhook", async (ctx) => {
    const id = ctx.request.query.id;
    const item = await WebHookRepo.findOneBy({ id: parseInt(id as string) });
    if (item) {
        const logs = await WebHookLog.createQueryBuilder()
            .where('"sourceId" = :id', { id: item.id })
            .getMany();
        await WebHookLog.remove(logs);
        ctx.body = JSON.stringify(await WebHookRepo.remove([item]));
    } else {
        ctx.body = JSON.stringify({ error: `没有发现 id 为${id}` });
    }
});
/** 测试订阅事件 */
WebHookRouter.patch("/webhook", webhook(), async (ctx) => {
    const hookMessage = {
        event: WebHookEvent.NULL,
        payload: { test: 120392039 },
    };
    ctx.response.webhook = hookMessage;
    ctx.body = JSON.stringify(hookMessage);
});

export { WebHookRouter };
