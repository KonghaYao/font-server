import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "test",
    synchronize: true,
    logging: true,
    entities: [],
    subscribers: [],
    migrations: [],
});
