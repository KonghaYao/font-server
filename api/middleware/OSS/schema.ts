export interface OSS {
    saveFile(fileName: string, file: Buffer): Promise<string>;
    getFile(fileName: string): Promise<Buffer>;
    deleteFile(fileName: string): Promise<void>;
}
