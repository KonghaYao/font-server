import axios from "axios";
import { getSelfIPs } from "./utils/getSelfIPs.js";
import pLimit from "p-limit";
import { RemoteStorage, UploadSingleStream } from "./RemoteStorage.js";

export class RemoteFactory {
    static subscribeWebHook: RemoteStorage["subscribeWebHook"] = async () => {
        const ipAddresses = getSelfIPs();

        console.log(`本机 IP 地址：${ipAddresses.join(", ")}`);
        return fetch(process.env.WEBHOOK_HOST + "/webhook", {
            method: "POST",
            body: JSON.stringify({
                url:
                    "http://" + ipAddresses[0] + ":" + process.env.PORT ?? "80",
            }),
            headers: { "content-type": "application/json" },
        })
            .then((res) => res.json())
            .then((res) => console.log("加入订阅完成", res));
    };
    static async getAllFiles(MINIO_HOST: string) {
        return await axios
            .get(MINIO_HOST + "/split", {
                params: {
                    limit: 999999,
                    offset: 0,
                    state: 2,
                },
            })
            .then((res) => {
                return res.data.map(
                    (data: { folder: string; files: string[]; id: number }) => {
                        return {
                            folder: "result-fonts/" + data.folder,
                            files: data.files.map(
                                (i: string) => "result-fonts/" + i
                            ),
                            id: data.id,
                        };
                    }
                );
            });
    }
    static async createFileStream(MINIO_HOST: string, path: string) {
        return await axios({
            responseType: "stream",
            url: MINIO_HOST + "/" + path,
        }).then((res) => {
            /** @ts-ignore */
            const length = res.headers.get("content-length") as string;
            if (!length) throw new Error(path + " 长度有误");
            return {
                stream: res.data,
                length: parseInt(length as string),
            };
        });
    }
    static createSyncAllFile = (
        MINIO_HOST: () => string,
        uploadSingleStream: UploadSingleStream,
        isExistedFolder: Function
    ): RemoteStorage["syncAllFiles"] => {
        return async () => {
            const records = await RemoteFactory.getAllFiles(MINIO_HOST());

            for (const item of records) {
                const isExisted = await isExistedFolder(item.folder);
                if (!isExisted) {
                    await RemoteFactory.syncDir(item, uploadSingleStream);
                    console.log("同步文件夹完成 ", item.id, item.folder);
                }
            }
        };
    };
    /** 并发同步文件夹 */
    static async syncDir(
        item: { files: string[] },
        uploadSingleStream: UploadSingleStream
    ) {
        const limit = pLimit(3);
        const list: Promise<void>[] = [];
        for (const path of item.files) {
            list.push(limit(() => uploadSingleStream(path)));
        }
        return Promise.all(list);
    }
    static createSyncMessageCallback(
        uploadSingleStream: UploadSingleStream
    ): RemoteStorage["getSyncMessage"] {
        return async (payload) => {
            await RemoteFactory.syncDir(payload, uploadSingleStream);
        };
    }
}
