import Router from "@koa/router";
import { WebHookRepo } from "../db/db.js";
import { webhook } from "../middleware/webhook.js";
import { WebHook, WebHookEvent, WebHookLog } from "../db/entity/webhook.js";
import { Like } from "typeorm";
import { AccessControl } from "../access_control.js";
const WebHookRouter = new Router();

/** 获取订阅事件列表 */
WebHookRouter.get("/webhook", AccessControl.check("admin"), async (ctx) => {
    const { limit, offset, q } = ctx.query;
    const res = await WebHook.find({
        skip: parseInt(offset as string),
        take: parseInt(limit as string),
        where: q
            ? {
                  url: Like(`%${q}%`),
              }
            : undefined,
        order: {
            id: "DESC",
        },
    });
    ctx.body = JSON.stringify(res);
});

/** 查询单个订阅 */
WebHookRouter.get("/webhook/:id", AccessControl.check("admin"), async (ctx) => {
    const { id } = ctx.params;
    const { logs, limit, offset, self } = ctx.query;
    const res = await WebHook.findOne({
        where: {
            id: parseInt(id),
        },
    });

    ctx.body = JSON.stringify({
        data: self === "false" ? null : res,
        logs: logs
            ? await WebHookLog.createQueryBuilder()
                  .where('"sourceId" = :id', { id: res!.id })
                  .skip(parseInt(offset as string))
                  .take(parseInt(limit as string))
                  .orderBy("id", "DESC")
                  .getMany()
            : null,
    });
});

/** 添加一个事件订阅 */
WebHookRouter.post("/webhook", AccessControl.check("admin"), async (ctx) => {
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
WebHookRouter.delete(
    "/webhook/:id",
    AccessControl.check("admin"),
    async (ctx) => {
        const { id } = ctx.params;
        const item = await WebHookRepo.findOneBy({ id: parseInt(id) });
        if (item) {
            const logs = await WebHookLog.createQueryBuilder()
                .where('"sourceId" = :id', { id: item.id })
                .getMany();
            await WebHookLog.remove(logs);
            ctx.body = JSON.stringify(await WebHookRepo.remove([item]));
        } else {
            ctx.body = JSON.stringify({ error: `没有发现 id 为${id}` });
        }
    }
);
/** 测试订阅事件 */
WebHookRouter.patch(
    "/webhook",
    AccessControl.check("admin"),
    webhook(),
    async (ctx) => {
        const hookMessage = {
            event: WebHookEvent.NULL,
            payload: { test: 120392039 },
        };
        ctx.response.webhook = hookMessage;
        ctx.body = JSON.stringify(hookMessage);
    }
);

export { WebHookRouter };
