import Koa from "koa";
import Router from "@koa/router";
import { koaBody } from "koa-body";
import logger from "koa-logger";
import { FontsRouter } from "./routers/fonts.js";
import { SplitRouter } from "./routers/split.js";

import { WebHookRouter } from "./routers/webhook.js";
const app = new Koa();
const router = new Router();

router
    .use(FontsRouter.routes())
    .use(SplitRouter.routes())
    .use(WebHookRouter.routes());

// 一些中间件
app.use(
    // 错误拦截
    async (ctx, next) => {
        try {
            await next();
        } catch (err: any) {
            ctx.status = err.status || 500;
            ctx.body = { status: err.status, error: err.message };
            ctx.app.emit("error", err, ctx);
        }
    }
)
    .use(logger())

    .use(
        koaBody({
            json: true,
            multipart: true,
            formidable: {
                maxFieldsSize: 20 * 1024 * 1024,
                keepExtensions: true,
                hashAlgorithm: "md5",
            },
        })
    )
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000, () => {
    console.log("服务启动了");
});
