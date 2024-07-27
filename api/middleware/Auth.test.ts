import { Elysia } from "elysia";
import Auth from "./Auth";
import { expect, test } from "bun:test";
const app = new Elysia()
    .use(
        Auth({
            async validation(token) {
                return token === "test";
            },
        })
    )
    .get("/", () => "test failed");

test("无 bearer 测试", async () => {
    const res = await app
        .handle(
            new Request("http://localhost/", {
                headers: {},
            })
        )
        .catch((e) => {
            return e;
        });
    expect(res.status).toBe(403);
});

test("错误 token 测试", async () => {
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
    ).toBe(403);
});

test("正确 token 测试", async () => {
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
    ).toBe(200);
});
