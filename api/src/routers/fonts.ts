import Router from "@koa/router";
import path from "path";
import { minioClient } from "../oss/index.js";
import { AppDataSource } from "../db/db.js";
import { FontSource } from "../db/entity/font.js";
const FontsRouter = new Router();

FontsRouter.post("/fonts", async (ctx) => {
    // check input
    const file = ctx.request.files!.font;
    if (file instanceof Array) {
        ctx.body = JSON.stringify({ error: "get multi key: font" });
        return;
    }
    console.log(file.hash);

    const name = file.hash! + path.extname(file.originalFilename!);
    // upload to minio
    const cb = await minioClient.fPutObject("user-fonts", name, file.filepath);
    console.log(name, cb);

    const source_path = "user-fonts/" + name;
    // update to database
    FontSource.create({
        path: source_path,
        md5:file.hash,
        versions:[],
        isSplit:false,
        name:ctx.reuqest.body.name??path.basename(file.originalFilename!)
    });

    ctx.body = JSON.stringify({
        data: { ...cb, path: source_path },
    });
});

export { FontsRouter };
