import Koa from "koa";
import { koaBody } from "koa-body";
const app = new Koa();

// 一些中间件
app.use(
    koaBody({
        json: true,
        multipart: true,
        formidable: {
            maxFieldsSize: 20 * 1024 * 1024,
            keepExtensions: true,
            hashAlgorithm: "md5",
        },
    })
).use(async (ctx) => {
    console.log(ctx.request.body);
});

app.listen(8888, () => {
    console.log("测试服务启动了");
});
