import { Elysia } from "elysia";
import Auth from "./Auth";
import { expect } from "chai";
const app = new Elysia()
    .use(
        Auth({
            async validation(token) {
                return token === "test";
            },
        })
    )
    .get("/", () => "test failed");

Deno.test("无 bearer 测试", async () => {
    const res = await app
        .handle(
            new Request("http://localhost/", {
                headers: {},
            })
        )
        .catch((e) => {
            return e;
        });
    expect(res.status).eql(403);
});

Deno.test("错误 token 测试", async () => {
    expect(
        (
            await app
                .handle(
                    new Request("http://localhost/", {
                        headers: {
                            Authorization: "Bearer testError",
                        },
                    })
                )
                .catch((e) => {
                    return e;
                })
        ).status
    ).eql(403);
});

Deno.test("正确 token 测试", async () => {
    expect(
        (
            await app
                .handle(
                    new Request("http://localhost/", {
                        headers: {
                            Authorization: "Bearer test",
                        },
                    })
                )
                .catch((e) => {
                    return e;
                })
        ).status
    ).eql(200);
});
