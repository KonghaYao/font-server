export interface IFontMessage {
    id: string;
    fontName: string;
    fontHash: string;
    fontUrl: string;
    fontSize: number;
}
export interface IFontSplitRecord {
    id: string;
    fontId: string;
    startTime: Date;
    logs: string;
    files: string;
    endTime?: Date | null;
    error?: string | null;
}

export type PaginationQuery<T> = (params: {
    page: number;
    limit: number;
}) => Promise<{
    data: T[];
    total: number;
}>;

export interface FontMessageManager {
    //  查询 =====
    queryUploadedFont: PaginationQuery<IFontMessage>;
    getUploadedFont: (fontHash: string) => Promise<IFontMessage>;
    queryFontSplitRecord: PaginationQuery<IFontSplitRecord>;

    //  创建或更新 （有 id 则更新） =====
    createOrUpdateUploadedFont: (
        data: Partial<IFontMessage>
    ) => Promise<{ id: string }>;
    createOrUpdateFontSplitRecord: (
        data: Partial<IFontSplitRecord>
    ) => Promise<{ id: string }>;
}
