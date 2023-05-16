import { Transform, Stream } from "stream";
import Koa, { Middleware } from "koa";

declare module "koa" {
    interface Response {
        stream?: StreamTransform;
    }
}
class StreamTransform extends Transform {
    opts: { opts: any; closeEvent: "close" };
    ended: boolean;
    constructor(public ctx: Koa.Context, opts: any = {}) {
        super({
            writableObjectMode: true,
        });
        this.opts = {
            closeEvent: "close",
            ...opts,
        };
        this.ended = false;
        ctx.req.socket.setTimeout(0);
        ctx.req.socket.setNoDelay(true);
        ctx.req.socket.setKeepAlive(true);
        ctx.set({
            "Content-Type": "text/plain",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            // 'Keep-Alive': 'timeout=120',
            "X-Accel-Buffering": "no",
        });
    }

    send(
        _data: string | Object,
        encoding?: undefined,
        callback?: (error: Error | null | undefined) => void
    ) {
        const data = typeof _data === "string" ? _data : JSON.stringify(_data);
        if (arguments.length === 0 || this.ended) return false;
        this.write(data, encoding, callback);
    }

    sendEnd(
        _data?: string | Object,
        encoding?: undefined,
        callback?: () => void
    ) {
        const data = typeof _data === "string" ? _data : JSON.stringify(_data);
        if (this.ended) {
            return false;
        }

        this.ended = true;
        if (!this.ended) {
            this.ended = true;
        }
        this.end(data, encoding, callback);
    }

    _transform(data: string, encoding?: any, callback?: () => void) {
        // Concentrated to send
        this.push(data + "\n");
        callback && callback();
    }
}

interface StreamConfig {
    maxClients: number;
    pingInterval: number;
    matchQuery: string;
    closeEvent: string;
}
const DEFAULT_OPTS: StreamConfig = {
    maxClients: 10000,
    pingInterval: 60000,
    closeEvent: "close",
    matchQuery: "",
};
/**
 * koa stream text callback
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

        await next();

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
