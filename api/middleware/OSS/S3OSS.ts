import { Client, type ClientOptions } from "minio";
import type { OSS } from "./schema";

/** 实现一个 S3 对象存储接口
 */
export class S3OSS extends Client implements OSS {
    constructor(options: ClientOptions, public bucketName: string) {
        super(options);
    }
    async saveFile(fileName: string, file: Buffer): Promise<string> {
        await this.putObject(this.bucketName, fileName, file, file.byteLength);
        // 返回 URL
        return fileName;
    }
    getFile(fileName: string): Promise<Buffer> {
        return this.getObject(this.bucketName, fileName).then((res) => {
            // 流转 buffer
            return new Promise((resolve, reject) => {
                const buffers: Buffer[] = [];
                res.on("data", (chunk) => {
                    buffers.push(chunk);
                });
                res.on("end", () => {
                    resolve(Buffer.concat(buffers as any));
                });
                res.on("error", (err) => {
                    reject(err);
                });
            });
        });
    }
    deleteFile(fileName: string): Promise<void> {
        return this.removeObject(this.bucketName, fileName);
    }
}

export const createOSS = () => {
    const url = new URL(process.env.MINIO_HOST!);
    return ensureBucket(
        new S3OSS(
            {
                endPoint: url.hostname,
                useSSL: url.protocol === "https:",
                port: Number.parseInt(url.port ?? "80"),
                accessKey: process.env.MINIO_ACCESS_KEY!,
                secretKey: process.env.MINIO_SECRET_KEY!,
            },
            "cn-font-split-fonts"
        ),
        "cn-font-split-fonts"
    );
};

export const ensureBucket = async (client: S3OSS, name: string) => {
    const isExist = await client.bucketExists(name);
    if (!isExist) {
        console.log("重新构建 OSS Bucket ", name);
        await client.makeBucket(name, "");

        await client.setBucketPolicy(
            name,
            JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: {
                            AWS: ["*"],
                        },
                        Action: ["s3:GetBucketLocation"],
                        Resource: [`arn:aws:s3:::${name}`],
                    },
                    {
                        Effect: "Allow",
                        Principal: {
                            AWS: ["*"],
                        },
                        Action: ["s3:ListBucket"],
                        Resource: [`arn:aws:s3:::${name}`],
                        Condition: {
                            StringEquals: {
                                "s3:prefix": ["*"],
                            },
                        },
                    },
                    {
                        Effect: "Allow",
                        Principal: {
                            AWS: ["*"],
                        },
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${name}/**`],
                    },
                ],
            })
        );
    }
    return client;
};
