import { DataSource } from "typeorm";
import { FontSource, FontSplit } from "./entity/font.js";
import { WebHook, WebHookLog } from "./entity/webhook.js";

export const AppDataSource = await new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [FontSource, FontSplit, WebHook, WebHookLog],
    subscribers: [],
    migrations: [],
})
    .initialize()
    .then((app) => {
        console.log("构建数据库完成");
        return app;
    });
export const FontSourceRepo = AppDataSource.getRepository(FontSource);
export const FontSplitRepo = AppDataSource.getRepository(FontSplit);
export const WebHookRepo = AppDataSource.getRepository(WebHook);
