import Koa from "koa";
import Router from "@koa/router";
import koaBody from "koa-body";
import cors from "@koa/cors";
import logger from "koa-logger";
import { FontsRouter } from "./routers/fonts.js";
import { initMinio } from "./oss/index.js";
const app = new Koa();
const router = new Router();

router.use(FontsRouter.routes());
// // 主要逻辑 遵循 restful api

// /** 查询单个字体详情 */
// const querySingleFontDetail = (params: { id: string; subName: string }) => {
//   return fetch(
//     `https://ik.imagekit.io/chinesefonts/packages/${params.id}/dist/${params.subName}/reporter.json`
//   ).then((res) => res.json());
// };

// /** 获取单独字体的信息 */
// router.get("/font/:id/:subName", async (ctx) => {
//   const res = await querySingleFontDetail(ctx.params as any);
//   ctx.body = JSON.stringify(res);
// });

// interface FontListInput {
//   /** 搜索文本 */
//   q?: string;
//   limit?: number;
//   skip?: number;
// }

// interface FontListResult {
//   /** 字体族归属的 ID */
//   fontsId: string;
//   /** 单独字体的标识 */
//   subName: string;
//   /** 字体中文名 */
//   name: string;
//   /** 这个是 CDN 路径 */
//   css: string;
//   /** 预览图片的地址 */
//   preview: string;
// }
// const queryFontList = async (
//   query: FontListInput
// ): Promise<FontListResult[]> => {
//   // 没有数据库，先这么用着
//   const res = await fetch(
//     "https://raw.githubusercontent.com/KonghaYao/chinese-free-web-font-storage/branch/index.json"
//   ).then((res) => {
//     return res.json();
//   });
//   return Object.entries<any>(res).flatMap(([key, value]) => {
//     return value.remotePath.map((i: string) => {
//       const [_, id, path] = i.match(/packages\/(.*?)\/dist\/(.*?)\//)!;
//       return {
//         fontsId: id,
//         subName: path,
//         preview: "https://ik.imagekit.io/chinesefonts/" + i.replace('result.css','preview.png'),
//         name: value.name,
//         css: "https://ik.imagekit.io/chinesefonts/" + i,
//       };
//     });
//   }) as FontListResult[];
// };

// /** 获取字体列表 */
// router.get("/font", async (ctx) => {
//   const query: FontListInput = ctx.query;

//   ctx.body = JSON.stringify(await queryFontList(query));
// });

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
        cors({
            origin: "*",
        })
    )
    .use(
        koaBody({
            multipart: true,
            formidable: {
                maxFieldsSize: 20 * 1024 * 1024,
                keepExtensions: true,
            },
        })
    )
    .use(router.routes())
    .use(router.allowedMethods());

(async () => {
    await initMinio();
    app.listen(3000, () => {
        console.log("服务启动了");
    });
})();
