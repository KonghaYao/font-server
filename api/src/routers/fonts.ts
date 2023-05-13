import Router from "@koa/router";

import { minioClient } from "../oss/index.js";
const FontsRouter = new Router();

FontsRouter.post("/fonts", async (ctx) => {
    // check input
    const file = ctx.request.files!.font;
    if (file instanceof Array) {
        ctx.body = JSON.stringify({ error: "get multi key: font" });
        return;
    }
    console.log(file);

    // upload to minio
    const cb = await minioClient.fPutObject(
        "user_fonts",
        file.originalFilename!,
        file.filepath
    );
    console.log(cb);

    // update to database

    ctx.body = JSON.stringify({
        data: cb,
    });
});

export { FontsRouter };
