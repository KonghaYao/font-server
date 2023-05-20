import { Middleware } from "koa";

type Roles = "null" | "reader" | "admin";

declare module "koa" {
    interface Request {
        acl: Roles;
    }
}
export class AppAccess {
    constructor(public adminToken: string, public readableToken: string) {
        this.roles.set(adminToken, "admin");
        this.roles.set(readableToken, "reader");
    }
    roles = new Map<string, Roles>();

    /** 总路径中解析头部获取验证信息 */
    protect(): Middleware {
        return async (ctx, next) => {
            const auth = ctx.request.headers.authorization;
            if (auth) {
                const [method, token] = auth.split(" ");
                if (method === "Bearer" && this.roles.has(token)) {
                    const acl = this.roles.get(token)!;
                    ctx.request.acl = acl;
                    await next();
                } else {
                    ctx.status = 415;
                    ctx.body = JSON.stringify({
                        error: "用户验证方式错误或者 token 不存在",
                    });
                }
            } else {
                ctx.status = 401;
                ctx.body = JSON.stringify({
                    error: "用户未验证，请使用 access token 请求 API",
                });
            }
        };
    }
    check(...args: Roles[]): Middleware {
        return async (ctx, next) => {
            if (args.includes(ctx.request.acl)) {
                await next();
            } else {
                ctx.status = 403;
                ctx.body = JSON.stringify({
                    error: ctx.request.acl + "未满足权限",
                });
            }
        };
    }
}
