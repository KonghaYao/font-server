import {DataSource} from "https://esm.sh/typeorm@0.3.16";


export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: Deno.env.get('DB_USERNAME'),
    password: Deno.env.get('DB_PASSWORD'),
    database: "test",
    synchronize: true,
    logging: true,
    entities: [],
    subscribers: [],
    migrations: [],
})