import { COSAdapter } from "./base.js";
import Koa from "koa";
import { koaBody } from "koa-body";
const cos = new COSAdapter(
    {
        SecretId: process.env.SecretId,
        SecretKey: process.env.SecretKey,
    },
    { Bucket: process.env.Bucket!, Region: process.env.Region! }
);
await cos.init();
await cos.subscribeWebHook();
await cos.syncAllFiles();
const app = new Koa();

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
    .use((ctx) => {
        const data = ctx.request.body;
        console.log(data);
        if (data.event === 1) {
            console.log("同步文件夹 ", data.payload.folder);
            // console.log(data.payload);
            cos.syncDir({
                files: data.payload.files.map(
                    (i: string) => "result-fonts/" + i
                ),
            });
        }
        // return cos.syncDir(data);
        ctx.body = JSON.stringify({
            success: "成功收到",
        });
    });
app.listen(process.env.PORT, () => {
    console.log("服务器运行中");
});
