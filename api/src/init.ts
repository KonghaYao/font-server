import { initMinio } from "./oss/index.js";

await initMinio();
await import("./db/db.js");
