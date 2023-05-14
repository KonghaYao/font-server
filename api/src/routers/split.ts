import Router from "@koa/router";
import path from "path";
import { minioClient } from "../oss/index.js";
import { AppDataSource, FontSourceRepo, FontSplitRepo } from "../db/db.js";
import { FontSource, FontSplit, SplitEnum } from "../db/entity/font.js";

const SplitRouter = new Router();

/** 切割字体 */
SplitRouter.post("/split", async (ctx) => {
    const { id, md5 } = ctx.query;
    const item = await FontSourceRepo.findOneBy({ id: parseInt(id as string) });
    if (item && md5 === item.md5) {
        const fontSplit = FontSplit.create({
            source: item,
            state: SplitEnum.idle,
        });
        await FontSplitRepo.save(fontSplit);
        const res = await minioClient.fGetObject("user-fonts", item.path);

    } else {
        throw new Error(`font id: ${id} and md5: ${md5} not found! `);
    }
});

export { SplitRouter };
