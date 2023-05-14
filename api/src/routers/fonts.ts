import Router from "@koa/router";
import path from "path";
import { minioClient } from "../oss/index.js";
import { FontSource, FontSplit } from "../db/entity/font.js";
import { FontSourceRepo } from "../db/db.js";
const FontsRouter = new Router();

/** 获取用户字体列表 */
FontsRouter.get("/fonts", async (ctx) => {
    const { limit, offset, q } = ctx.query;
    let query = FontSourceRepo.createQueryBuilder("*")
        .orderBy("id", "DESC")
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
    if (q) query = query.where(`name LIKE '%' || :q || '%'`, { q });

    const res = await query.getMany();
    ctx.body = JSON.stringify(res);
});

FontsRouter.get("/fonts/:id", async (ctx) => {
    const { id } = ctx.params;
    let query = await FontSourceRepo.findOneBy({ id: parseInt(id as string) });

    ctx.body = JSON.stringify(query);
});

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
        versions: [] as FontSplit[],
        name: ctx.request.body.name ?? path.basename(file.originalFilename!),
    });

    const res = await FontSourceRepo.save(source);

    ctx.body = JSON.stringify({
        data: { data: res, ...cb, path: source_path },
    });
});

export { FontsRouter };
