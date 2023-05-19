import { Middleware } from "koa";
import { StreamTransform } from "./StreamTransform.js";
export interface StreamConfig {
    maxClients: number;
    pingInterval: number;
    matchQuery: string;
    closeEvent: string;
}

declare module "koa" {
    interface Response {
        stream?: StreamTransform;
    }
}
const DEFAULT_OPTS: StreamConfig = {
    maxClients: 10000,
    pingInterval: 60000,
    closeEvent: "close",
    matchQuery: "",
};
/**
 * koa stream text callback
 * 控制台数据流式返回
 */
export function stream(opts: Partial<StreamConfig> = {}): Middleware {
    const config = Object.assign({}, DEFAULT_OPTS, opts);
    const streamPool = new Set<StreamTransform>();

    return async (ctx, next) => {
        if (ctx.res.headersSent) {
            if (!(ctx.sse instanceof StreamTransform)) {
                console.error(
                    "SSE response header has been send, Unable to create the sse response"
                );
            }
            return await next();
        }
        if (streamPool.size >= config.maxClients ?? 0) {
            console.error(
                "SSE sse client number more than the maximum, Unable to create the sse response"
            );
            return await next();
        }
        if (
            config.matchQuery &&
            typeof ctx.query[config.matchQuery] === "undefined"
        ) {
            return await next();
        }
        let stream = new StreamTransform(ctx);
        streamPool.add(stream);
        stream.on("close", function () {
            streamPool.delete(stream);
        });
        ctx.response.stream = stream;

        // ! 不能进行异步等待，需要直接返回数据
        next().catch((e) => {
            ctx.response.stream?.sendEnd({
                error: e.message,
            });
        });

        if (!ctx.body) {
            ctx.body = ctx.response.stream;
        } else {
            if (!ctx.response.stream.ended) {
                ctx.response.stream.send(ctx.body);
            }
            ctx.body = stream;
        }
    };
}
