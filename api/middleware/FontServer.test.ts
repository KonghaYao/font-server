import { Elysia } from "elysia";
import { expect, test } from "bun:test";
import FontServer from "./FontServer";
import fs from "node:fs";
const app = new Elysia()
    .use(
        FontServer({
            async outputFile(name, file) {
                console.log(name);
            },
        })
    )
    .get("/", () => "test failed");

test("构建测试", async () => {
    const file = fs.readFileSync("../data/fonts/SmileySans-Oblique.otf");
    const hasher = new Bun.CryptoHasher("sha256");
    hasher.update(file as unknown as Uint8Array);
    const hash = hasher.digest("hex");
    const res = await app.handle(
        new Request("http://localhost/split", {
            method: "POST",
            headers: {
                "content-type": "application/octet-stream",
                "x-file-hash": hash,
                "x-file-name": "SmileySans-Oblique.otf",
            },
            body: file,
        })
    );
    expect(res.status).toBe(200);
    expect((await res.text()).length).toBeGreaterThan(100);
});
