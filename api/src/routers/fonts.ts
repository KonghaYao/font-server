import Router from "@koa/router";
import path from "path";
import { minioClient } from "../oss/index.js";
const FontsRouter = new Router();

FontsRouter.post("/fonts", async (ctx) => {
    // check input
    const file = ctx.request.files!.font;
    if (file instanceof Array) {
        ctx.body = JSON.stringify({ error: "get multi key: font" });
        return;
    }
    console.log(file.hash);

    const name = file.hash! + path.extname(file.originalFilename!)
    // upload to minio
    const cb = await minioClient.fPutObject(
        "user-fonts",
        name,
        file.filepath
    );
    console.log(name,cb);

    // update to database

    ctx.body = JSON.stringify({
        data: {...cb,path:"user-fonts/"+name},
    });
});

export { FontsRouter };
