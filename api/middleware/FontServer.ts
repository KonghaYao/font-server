import { Elysia, t } from "elysia";
import { Stream } from "@elysiajs/stream";
import { fontSplit, type InputTemplate, type IOutputFile } from "cn-font-split";
import type { FontMessageManager } from "./Storage/schema";
import type { OSS } from "./OSS/schema";

const saveOriginFile = async (
    config: { storage: FontMessageManager; oss: OSS },
    filename: string,
    buffer: Uint8Array
) => {
    const url = await config.oss.saveFile(filename, Buffer.from(buffer));
    const hash = new Bun.CryptoHasher("sha256").update(buffer).digest("hex");

    const { id: savedFontId } = await config.storage
        .createOrUpdateUploadedFont({
            fontHash: hash,
            fontName: filename,
            fontSize: buffer.byteLength,
            fontUrl: url,
        })
        .catch((e) => {
            return config.storage.getUploadedFont(hash);
        });
    return savedFontId;
};

export default (config: {
        fontSplitOverride?: InputTemplate;
        storage: FontMessageManager;
        oss: OSS;
    }) =>
    (app: Elysia) =>
        new Elysia().post(
            "/split",
            async (ctx) => {
                const stream = new Stream();
                const fileHash = ctx.headers["x-file-hash"];
                const filename = ctx.headers["x-file-name"];
                const fileBlob = new Uint8Array(ctx.body as ArrayBuffer);
                stream.send(`文件存储开始 ${fileHash}`);
                const fontId = await saveOriginFile(
                    config,
                    `/origin-font/${filename}`,
                    fileBlob
                );
                stream.send("文件存储完毕");
                let logs = "";
                let files = "";
                const { id: fontSplitGroupId } =
                    await config.storage.createOrUpdateFontSplitRecord({
                        fontId,
                        startTime: new Date(),
                        logs,
                        files,
                    });

                stream.send("构建开始");

                await fontSplit({
                    ...config.fontSplitOverride,
                    FontPath: new Uint8Array(ctx.body as ArrayBuffer),
                    destFold: `/${fileHash}`,
                    log(...args) {
                        stream.send(args);
                        logs += `${args.join(" ")}\n`;
                        config.storage.createOrUpdateFontSplitRecord({
                            id: fontSplitGroupId,
                            logs,
                        });
                    },
                    async outputFile(name, blob) {
                        await config.oss.saveFile(
                            `/${process.env.S3_FONT_PREFIX}/${name}`,
                            Buffer.from(blob)
                        );
                        files += `/${process.env.S3_FONT_PREFIX}/${name},`;
                    },
                })
                    .then(() => {
                        config.storage.createOrUpdateFontSplitRecord({
                            id: fontSplitGroupId,
                            endTime: new Date(),
                            logs,
                            files,
                        });
                        stream.send("构建完成");
                        stream.close();
                    })
                    .catch((e: Error) => {
                        logs += `${e.message}\n`;
                        stream.send(e.message);
                        config.storage.createOrUpdateFontSplitRecord({
                            id: fontSplitGroupId,
                            endTime: new Date(),
                            logs,
                            files,
                            error: e.message,
                        });

                        stream.close();
                    });

                return stream;
            },
            {
                headers: t.Object({
                    "content-type": t.String({
                        examples: ["application/octet-stream"],
                    }),
                    "x-file-hash": t.String(),
                    "x-file-name": t.String(),
                }),
                body: t.Any(),
            }
        );
