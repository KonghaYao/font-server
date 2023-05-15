import Router from "@koa/router";
import path from "path";
import { minioClient } from "../oss/index.js";
import { FontSourceRepo, FontSplitRepo } from "../db/db.js";
import { FontSource, FontSplit, SplitEnum } from "../db/entity/font.js";
import { fontSplit } from "@konghayao/cn-font-split";
import { createTempPath } from "../useTemp.js";
import fs from "fs/promises";
import { webhook } from "../middleware/webhook.js";
import { WebHookEvent } from "../db/entity/webhook.js";
const SplitRouter = new Router();

/* ! node 某一个版本新加的 api 导致库的环境判断失误，会BUG */
(globalThis as any)._fetch = globalThis.fetch;
(globalThis as any).fetch = null;

/** 切割字体 */
SplitRouter.post("/split", webhook(), async (ctx) => {
    // TODO 改用 SSE 返回数据
    const { id, md5 } = ctx.request.body;
    const item = await FontSourceRepo.findOneBy({ id: parseInt(id as string) });
    if (item && md5 === item.md5) {
        const newFontSplit = FontSplit.create({
            source: item,
            state: SplitEnum.idle,
            folder: "",
        });
        await FontSplitRepo.save(newFontSplit);

        const tempFilePath = createTempPath(item.path);
        const destFilePath = createTempPath(
            path.dirname(item.path),
            path.basename(item.path, path.extname(item.path))
        );
        console.log(tempFilePath, destFilePath);

        // fixed: 阻止 otf 打包不了的问题
        if (path.extname(tempFilePath).endsWith("otf")) {
            throw new Error("暂不支持 otf 文件");
        }
        await minioClient.fGetObject(
            "user-fonts",
            path.basename(item.path),
            tempFilePath
        );

        newFontSplit.state = SplitEnum.cutting;
        await FontSourceRepo.save(newFontSplit);

        await fontSplit({
            FontPath: tempFilePath,
            destFold: destFilePath,
            targetType: "woff2",
            chunkSize: 70 * 1024,
            testHTML: false,
            previewImage: {},
        });

        // 上传全部文件到 minio
        const folder = path.join(item.md5, newFontSplit.id.toString());
        const data = await fs.readdir(destFilePath);
        await Promise.all(
            data.map(async (i) => {
                const file = path.join(destFilePath, i);
                await minioClient.fPutObject(
                    "result-fonts",
                    path.join(folder, i),
                    file
                );
            })
        );

        newFontSplit.folder = folder;
        newFontSplit.state = SplitEnum.success;
        await FontSplitRepo.save(newFontSplit);

        ctx.body = JSON.stringify(newFontSplit);

        // 发布 webhook
        ctx.response.webhook = {
            event: WebHookEvent.SPLIT_SUCCESS,
            payload: newFontSplit,
        };
    } else {
        throw new Error(`font id: ${id} and md5: ${md5} not found! `);
    }
});

SplitRouter.get("/split", async (ctx) => {
    const { limit, offset, state, source } = ctx.query;

    const res = await FontSplit.find({
        skip: parseInt(offset as string),
        take: parseInt(limit as string),
        where: {
            state: state ? parseInt(state as string) : undefined,
            source: {
                id: source ? parseInt(source as string) : undefined,
            },
        },
        order: {
            id: "DESC",
        },
        relations: ["source"],
    });
    ctx.body = JSON.stringify(res);
});

export { SplitRouter };
