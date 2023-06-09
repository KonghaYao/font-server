import Router from "@koa/router";
import path from "path";
import { minioClient } from "../oss/index.js";
import { FontSource, FontSplit } from "../db/entity/font.js";
import { FontSourceRepo } from "../db/db.js";
import { Like } from "typeorm";
import { webhook } from "../middleware/webhook.js";
import { WebHookEvent } from "../db/entity/webhook.js";
import { AccessControl } from "../access_control.js";

const FontsRouter = new Router();

/** 获取用户字体列表 */
FontsRouter.get(
    "/fonts",
    AccessControl.check("reader", "admin"),
    async (ctx) => {
        const { limit, offset, q, versions } = ctx.query;
        const res = await FontSourceRepo.find({
            skip: parseInt(offset as string),
            take: parseInt(limit as string),
            where: q
                ? {
                      name: Like(`%${q}%`),
                  }
                : undefined,
            order: {
                id: "DESC",
            },
            relations: [versions && "versions"].filter((i) => i) as string[],
        });

        ctx.body = JSON.stringify(res);
    }
);

FontsRouter.get(
    "/fonts/:id",
    AccessControl.check("reader", "admin"),
    async (ctx) => {
        const { versions } = ctx.request.query;
        const { id } = ctx.params;
        let query = await FontSourceRepo.findOne({
            where: {
                id: parseInt(id as string),
            },
            relations: versions === "true" ? ["versions"] : undefined,
        });

        ctx.body = JSON.stringify(query);
    }
);

// TODO 删除用户上传字体

/** 用户上传字体 */
FontsRouter.post(
    "/fonts",
    AccessControl.check("admin"),
    webhook(),
    async (ctx) => {
        // 检查输入
        const file = ctx.request.files!.font;
        if (file instanceof Array) {
            ctx.body = JSON.stringify({ error: "get multi key: font" });
            return;
        }
        const name = file.hash! + path.extname(file.originalFilename!);
        const source_path = "user-fonts/" + name;

        // 上传 MINIO
        const cb = await minioClient.fPutObject(
            "user-fonts",
            name,
            file.filepath
        );
        console.log(name, cb, ctx.request.body);

        // 上传数据库
        const source = FontSource.create({
            path: source_path,
            md5: file.hash!,
            size: file.size,
            versions: [] as FontSplit[],
            name:
                ctx.request?.body?.name ??
                path.basename(file.originalFilename!),
        });

        const res = await FontSourceRepo.save(source);
        const data = { data: res, ...cb, path: source_path };
        ctx.response.webhook = {
            event: WebHookEvent.UPLOAD_SUCCESS,
            payload: data,
        };

        ctx.body = JSON.stringify({
            data,
        });
    }
);

export { FontsRouter };
