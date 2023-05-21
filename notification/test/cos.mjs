import { COSAdapter } from "../dist/adapter/COS.js";
import { PusherCore } from "../dist/core.js";

const adapter = new COSAdapter(
    {
        SecretId: process.env.SecretId,
        SecretKey: process.env.SecretKey,
    },
    {
        Bucket: process.env.Bucket,
        Region: process.env.Region,
        WEBHOOK_HOST: process.env.WEBHOOK_HOST,
        MINIO_HOST: process.env.MINIO_HOST,
    }
);
const core = new PusherCore(adapter, {
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
});

try {
    await core.run();
} catch (e) {
    console.error(e);
}
