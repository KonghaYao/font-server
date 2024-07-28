import { Elysia } from "elysia";
import FontServer from "../middleware/FontServer";
import { createOSS } from "../middleware/OSS/S3OSS";
import { PrismaAdapter } from "../middleware/Storage/Prisma";
import Auth from "../middleware/Auth";
const oss = await createOSS();
const storage = new PrismaAdapter();
const app = new Elysia()
    .use(
        Auth({
            async validation(token) {
                return token === process.env.FONT_SERVER_TOKEN;
            },
        })
    )
    .use(
        FontServer({
            oss,
            storage,
        })
    );
Bun.serve({
    fetch: app.fetch,
});
