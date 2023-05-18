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
console.log("初始化远程");
await cos.init();
await cos.subscribeWebHook();
await cos.syncAllFiles();

// 记得挂一个缓存控制
// await cos.changeCORS();
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
        if (data.event === 1) {
            console.log("同步文件夹 ", data.payload.folder);
            // console.log(data.payload);
            cos.syncDir({
                files: data.payload.files.map(
                    (i: string) => "result-fonts/" + i
                ),
            }).then((res) => {
                console.log("同步文件夹完成 ", data.payload.folder);
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
