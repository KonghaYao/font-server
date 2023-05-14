import { DataSource } from "typeorm";
import { FontSource, FontSplit } from "./entity/font.js";

export const AppDataSource = await new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "postgres",
    synchronize: true,
    logging: false,
    entities: [FontSource, FontSplit],
    subscribers: [],
    migrations: [],
}).initialize();
export const FontSourceRepo = AppDataSource.getRepository(FontSource);
export const FontSplitRepo = AppDataSource.getRepository(FontSplit);
