import Koa from "koa";
import { koaBody } from "koa-body";
import { RemoteStorage } from "./RemoteStorage.js";

export interface PusherCoreConfig {
    port: number;
}

export class PusherCore {
    constructor(
        public adapter: RemoteStorage,
        public config: Partial<PusherCoreConfig> = {}
    ) {}
    async run() {
        const cos = this.adapter;
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
            .use(async (ctx) => {
                const data = ctx.request.body;
                if (data.event === 1) {
                    console.log("同步文件夹 ", data.payload.folder);
                    // console.log(data.payload);
                    await cos
                        .getSyncMessage({
                            files: data.payload.files.map(
                                (i: string) => "result-fonts/" + i
                            ),
                        })
                        .then((res) => {
                            console.log("同步文件夹完成 ", data.payload.folder);
                        });
                }
                // return cos.syncDir(data);
                ctx.body = JSON.stringify({
                    success: "成功收到",
                });
            });
        app.listen(this.config.port ?? 3001, () => {
            console.log("服务器运行中", this.config.port ?? 3001);
        });
    }
}
