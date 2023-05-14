import Router from "@koa/router";
import path from "path";
import { minioClient } from "../oss/index.js";
import { AppDataSource } from "../db/db.js";
import { FontSource } from "../db/entity/font.js";
const FontsRouter = new Router();

/** 用户上传字体 */
FontsRouter.post("/fonts", async (ctx) => {
    // 检查输入
    const file = ctx.request.files!.font;
    if (file instanceof Array) {
        ctx.body = JSON.stringify({ error: "get multi key: font" });
        return;
    }
    const name = file.hash! + path.extname(file.originalFilename!);
    const source_path = "user-fonts/" + name;
    console.log(file.hash);

    // 上传 MINIO
    const cb = await minioClient.fPutObject("user-fonts", name, file.filepath);
    console.log(name, cb);

    // 上传数据库
    const source = FontSource.create({
        path: source_path,
        md5: file.hash!,
        versions: [] as any[],
        isSplit: false,
        name: ctx.request.body.name ?? path.basename(file.originalFilename!),
    });
    const repo = await AppDataSource.getRepository(FontSource);
    const res = await repo.save(source);

    ctx.body = JSON.stringify({
        data: { data: res, ...cb, path: source_path },
    });
});

export { FontsRouter };
