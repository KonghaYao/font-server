import type {
    FontMessageManager,
    IFontMessage,
    IFontSplitRecord,
} from "./schema";
import { PrismaClient } from "@prisma/client";

export class PrismaAdapter implements FontMessageManager {
    client: PrismaClient;
    constructor() {
        this.client = new PrismaClient();
    }
    async queryUploadedFont(params: { page: number; limit: number }) {
        const items = await this.client.fontMessage.findMany({
            skip: (params.page - 1) * params.limit,
            take: params.limit,
        });
        const total = await this.client.fontMessage.count();
        return {
            data: items,
            total,
        };
    }
    async getUploadedFont(fontHash: string) {
        return this.client.fontMessage.findUniqueOrThrow({
            where: {
                fontHash,
            },
        });
    }
    async queryFontSplitRecord(params: { page: number; limit: number }) {
        const items = await this.client.fontSplitRecord.findMany({
            skip: (params.page - 1) * params.limit,
            take: params.limit,
        });
        const total = await this.client.fontSplitRecord.count();
        return {
            data: items,
            total,
        };
    }

    async createOrUpdateUploadedFont(data: Partial<IFontMessage>) {
        if (!data.id) {
            return await this.client.fontMessage.create({
                data: data as IFontMessage,
            });
        }
        const res = await this.client.fontMessage.update({
            where: { id: data.id },
            data,
        });
        return { id: res.id };
    }
    async createOrUpdateFontSplitRecord(data: Partial<IFontSplitRecord>) {
        if (!data.id) {
            return await this.client.fontSplitRecord.create({
                data: data as IFontSplitRecord,
            });
        }
        const res = await this.client.fontSplitRecord.update({
            where: { id: data.id },
            data,
        });
        return { id: res.id };
    }
}
