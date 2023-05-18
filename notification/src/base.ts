import COS from "cos-nodejs-sdk-v5";
import axios from "axios";
import { getSelfIPs } from "./utils/getSelfIPs";
import pLimit from "p-limit";
interface COSConfig {
    SecretId: string;
    SecretKey: string;
    Bucket: string;
    Region: string;
}

export class COSAdapter extends COS {
    constructor(opt: COS.COSOptions, public config: COSConfig) {
        super(opt);
    }

    async init() {
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

    /** 同步内部对象存储到远程 */
    async syncAllFiles() {
        const records = await axios
            .get(process.env.WEBHOOK_HOST + "/split", {
                params: {
                    limit: 30000,
                    offset: 0,
                    state: 2,
                },
            })
            .then(
                (res) =>
                    res.data as {
                        folder: string;
                        files: string[];
                        id: number;
                    }[]
            );

        for (const item of records) {
            const isExisted = await this.isExistedFolder(
                "result-fonts/" + item.folder
            );
            if (!isExisted) {
                await this.syncDir({
                    files: item.files.map((i) => "result-fonts/" + i),
                });
                console.log("同步文件夹完成 ", item.id, item.folder);
            }
        }
    }

    /** 并发同步文件夹 */
    async syncDir(item: { files: string[] }) {
        const limit = pLimit(3);
        const list: Promise<COS.PutObjectResult>[] = [];
        for (const path of item.files) {
            list.push(limit(() => this.syncWithBucket(path)));
        }
        return Promise.all(list);
    }
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
    async syncWithBucket(path: string) {
        const response = await axios({
            responseType: "stream",
            url: process.env.MINIO_HOST + "/" + path,
        }).then((res) => {
            const length = res?.headers?.["Content-Length"];
            if (!length) throw new Error(path + " 长度有误");
            console.log(length);

            return {
                stream: res.data,
                length: parseInt(length as string),
            };
        });
        return new Promise<COS.PutObjectResult>((res, rej) => {
            this.putObject(
                {
                    ...this.config,
                    Key: path,
                    StorageClass: "STANDARD",
                    /* 当 Body 为 stream 类型时，ContentLength 必传，否则 onProgress 不能返回正确的进度信息 */
                    Body: response.stream,
                    ContentLength: response.length,
                    onProgress: function (progressData) {
                        console.log(JSON.stringify(progressData));
                    },
                },
                (err, data) => (err ? rej(err) : res(data))
            );
        });
    }
    /** 订阅 IP 地址 */
    async subscribeWebHook() {
        const ipAddresses = getSelfIPs();

        console.log(`本机 IP 地址：${ipAddresses.join(", ")}`);
        return fetch(process.env.WEBHOOK_HOST + "/webhook", {
            method: "POST",
            body: JSON.stringify({ url: ipAddresses[0] }),
            headers: { "content-type": "application/json" },
        })
            .then((res) => res.json())
            .then((res) => console.log(res));
    }
}