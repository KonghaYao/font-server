export type UploadSingleStream = (path: string) => Promise<any>;

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
