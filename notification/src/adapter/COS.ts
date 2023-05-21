import COS from "cos-nodejs-sdk-v5";
import { RemoteStorage } from "../RemoteStorage.js";
import { RemoteFactory } from "../RemoteFactory.js";
interface COSConfig {
    Bucket: string;
    Region: string;
    WEBHOOK_HOST: string;
    MINIO_HOST: string;
}

export class COSAdapter extends COS implements RemoteStorage {
    constructor(opt: COS.COSOptions, public config: COSConfig) {
        super({ ...opt, ...config });
        console.log(config);
    }

    async init() {
        console.log("检测桶存在");
        const isExisted = await this.checkBucket();
        if (!isExisted) {
            await this.createBucket({
                ...this.config,
                ACL: "public-read",
            });
        }
    }

    async checkBucket() {
        return new Promise<boolean>((res, rej) => {
            this.headBucket(this.config, (err, data) => {
                if (err) {
                    if (err.statusCode == 404) {
                        console.log(this.config.Bucket + " 存储桶不存在");
                        res(false);
                    } else if (err.statusCode == 403) {
                        rej(this.config.Bucket + " 没有该存储桶读权限");
                    } else {
                        rej(err);
                    }
                } else {
                    console.log("存储桶存在");
                    res(true);
                }
            });
        });
    }
    async createBucket(config: COS.PutBucketParams) {
        return new Promise<COS.PutBucketResult>((res, rej) => {
            console.log("创建桶 " + this.config.Bucket);
            this.putBucket(config, (err, data) => (err ? rej(err) : res(data)));
        });
    }

    subscribeWebHook = RemoteFactory.subscribeWebHook;
    syncAllFiles = RemoteFactory.createSyncAllFile(
        () => this.config.WEBHOOK_HOST,
        this.uploadSingleStream.bind(this),
        this.isExistedFolder.bind(this)
    );
    getSyncMessage = RemoteFactory.createSyncMessageCallback(
        this.uploadSingleStream.bind(this)
    );
    /** 判断远程是否存在 */
    async isExistedFolder(folder: string) {
        return new Promise<boolean>((res, rej) => {
            this.headObject(
                {
                    ...this.config,
                    Key: folder + "/result.css",
                },
                (err, data) => {
                    if (err) {
                        if (err.statusCode == 404) {
                            res(false);
                        } else if (err.statusCode == 403) {
                            rej("没有该对象读权限");
                        }
                    }
                    if (data) res(true);
                }
            );
        });
    }
    /** 构建流式同步传输 */
    async uploadSingleStream(path: string) {
        const response = await RemoteFactory.createFileStream(
            this.config.MINIO_HOST,
            path
        );
        return new Promise<COS.PutObjectResult>((res, rej) => {
            this.putObject(
                {
                    ...this.config,

                    Key: path,
                    StorageClass: "STANDARD",
                    /* 当 Body 为 stream 类型时，ContentLength 必传，否则 onProgress 不能返回正确的进度信息 */
                    Body: response.stream,
                    ContentLength: response.length,
                },
                (err, data) => (err ? rej(err) : res(data))
            );
        });
    }

    changeCORS() {
        return this.putBucketCors({
            ...this.config,
            CORSRules: [
                {
                    AllowedOrigin: ["*"],
                    AllowedMethod: ["GET", "POST", "PUT", "DELETE", "HEAD"],
                    AllowedHeader: ["*"],
                    ExposeHeader: [
                        "ETag",
                        "x-cos-acl",
                        "x-cos-version-id",
                        "x-cos-delete-marker",
                        "x-cos-server-side-encryption",
                    ],
                    MaxAgeSeconds: 5,
                },
            ],
        });
    }
}
