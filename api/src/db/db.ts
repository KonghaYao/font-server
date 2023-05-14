import { createConnection } from "typeorm";
import { FontSource, FontSplit } from "./entity/font.js";

export const AppDataSource = await createConnection({
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
});
