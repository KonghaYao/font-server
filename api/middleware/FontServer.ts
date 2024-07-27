import { Elysia, t } from "elysia";
import { Stream } from "@elysiajs/stream";
import { fontSplit, type InputTemplate, type IOutputFile } from "cn-font-split";

export default (config: {
        outputFile: IOutputFile;
        fontSplitOverride?: InputTemplate;
    }) =>
    (app: Elysia) =>
        new Elysia().post(
            "/split",
            async (ctx) => {
                const stream = new Stream();
                const fileHash = ctx.request.headers.get("x-file-hash");
                const filename = ctx.request.headers.get("x-file-name");

                stream.send("构建开始");
                await fontSplit({
                    ...config.fontSplitOverride,
                    FontPath: new Uint8Array(ctx.body as ArrayBuffer),
                    destFold: `/${fileHash}`,
                    log(...args) {
                        stream.send(args);
                    },
                    outputFile: config.outputFile,
                });
                stream.send("构建完成");
                stream.close();
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
