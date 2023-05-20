import { AppAccess } from "./middleware/access/index.js";

export const AccessControl = new AppAccess(
    process.env.ADMIN_TOKEN!,
    process.env.READABLE_TOKEN!
);
