import Router from "@koa/router";
import path from "path";
import { minioClient } from "../oss/index.js";
import { FontSourceRepo, FontSplitRepo } from "../db/db.js";
import { FontSplit, SplitEnum } from "../db/entity/font.js";
import { fontSplit } from "@konghayao/cn-font-split";
import { createTempPath } from "../useTemp.js";
import fs from "fs/promises";
import { webhook } from "../middleware/webhook.js";
import { WebHookEvent } from "../db/entity/webhook.js";
import { stream } from "../middleware/stream/index.js";
import { AccessControl } from "../access_control.js";

const SplitRouter = new Router();

/* ! node 某一个版本新加的 api 导致库的环境判断失误，会BUG */
(globalThis as any)._fetch = globalThis.fetch;
(globalThis as any).fetch = null;

/** 切割字体 */
SplitRouter.post(
    "/split",
    AccessControl.check("admin"),
    stream(),
    webhook(),
    async (ctx) => {
        const stream = ctx.response.stream!;
        const { id, md5 } = ctx.request.body;
        const item = await FontSourceRepo.findOneBy({
            id: parseInt(id as string),
        });
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
            await FontSourceRepo.save({
                id: newFontSplit.id,
                state: SplitEnum.cutting,
            });

            stream.send(["开始打包"]);
            await fontSplit({
                FontPath: tempFilePath,
                destFold: destFilePath,
                targetType: "woff2",
                chunkSize: 70 * 1024,
                testHTML: false,
                previewImage: {
                    text: process.env.PREVIEW_TEXT,
                },
                log(...args: any[]) {
                    stream.send(args);
                },
            });

            // 上传全部文件到 minio
            const folder = path.join(item.md5, newFontSplit.id.toString());
            const data = await fs.readdir(destFilePath);
            const paths = await Promise.all(
                data.map(async (i) => {
                    const file = path.join(destFilePath, i);
                    const newPath = path.join(folder, i);
                    await minioClient.fPutObject("result-fonts", newPath, file);
                    return newPath;
                })
            );
            stream.send(["存储 MINIO 完成"]);

            await FontSplitRepo.save({
                id: newFontSplit.id,
                folder,
                files: paths,
                state: SplitEnum.success,
            });

            stream.sendEnd(newFontSplit);

            // 发布 webhook
            ctx.response.webhook = {
                event: WebHookEvent.SPLIT_SUCCESS,
                payload: newFontSplit,
            };
        } else {
            ctx.response.stream?.sendEnd({
                error: `${item?.id} or ${item?.md5} not found`,
            });
        }
    }
);

SplitRouter.get(
    "/split",
    AccessControl.check("reader", "admin"),
    async (ctx) => {
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
    }
);

export { SplitRouter };
