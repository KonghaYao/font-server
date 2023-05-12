import type { KoaBodyMiddlewareOptions } from "https://esm.sh/koa-body";
import Koa from "https://esm.sh/koa";
import Router from "https://esm.sh/@koa/router";
import koaBody from "https://esm.sh/koa-body";
import cors from "https://esm.sh/@koa/cors";
import logger from "https://esm.sh/koa-logger";
const app = new Koa();
const router = new Router();

// 主要逻辑






// 一些中间件
app
  .use(
    // 错误拦截
    async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.status = err.status || 500;
        ctx.body = { status: err.status, error: err.message };
        ctx.app.emit("error", err, ctx);
      }
    }
  )
  .use(logger())
  .use(
    cors({
      origin: "*",
    })
  )
  .use(
    koaBody({
      multipart: true,
    })
  )
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000, () => {
  console.log("服务启动了");
});
