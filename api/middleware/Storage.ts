import { Elysia } from "elysia";

new Elysia()
    .get("/", () => "hello")
    .post("/hi", () => "hi")
    .listen(3000);

interface Storage {
    get(key: string): Promise<string | undefined>;
    set(key: string, value: string): Promise<void>;
    delete(key: string): Promise<void>;
}
