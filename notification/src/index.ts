import { COSAdapter } from "./adapter/COS";
import { PusherCore } from "./core";

const core = new PusherCore(
    new COSAdapter(
        {
            SecretId: process.env.SecretId!,
            SecretKey: process.env.SecretKey!,
        },
        {
            Bucket: process.env.Bucket!,
            Region: process.env.Region!,
            WEBHOOK_HOST: process.env.WEBHOOK_HOST!,
            MINIO_HOST: process.env.MINIO_HOST!,
        }
    ),
    { port: process.env.PORT ? parseInt(process.env.PORT) : 3001 }
);
core.run();
