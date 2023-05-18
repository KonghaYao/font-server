import { Transform } from "stream";
import Koa from "koa";

export class StreamTransform extends Transform {
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
