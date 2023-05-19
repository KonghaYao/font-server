import { getSelfIPs } from "./utils/getSelfIPs.js";

export class RemoteStorageDefault {
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
            .then((res) => console.log(res));
    };
}

export interface RemoteStorage {
    /** 1. 初始化远程服务器 */
    init(): Promise<void>;
    /** 2. 订阅 IP 地址 */
    subscribeWebHook(): Promise<void>;
    /** 3. 同步内部对象存储到远程 */
    syncAllFiles(): Promise<void>;
    /** 4. 接收到订阅 */
    getSyncMessage(payload: { files: string[] }): Promise<void>;
}
