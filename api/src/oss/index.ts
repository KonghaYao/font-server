import Minio from "minio";

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_POINT!,
    port: 9000,
    useSSL: true,
    accessKey: process.env.MINIO_ROOT_USER!,
    secretKey: process.env.MINIO_ROOT_PASSWORD!,
});

/** 初始化 MINIO  */
export const initMinio = async () => {
    await ensureBucket("user_fonts");
    await ensureBucket("result_fonts");
};

export const ensureBucket = async (name: string) => {
    const isExist = await minioClient.bucketExists(name);
    if (!isExist) await minioClient.makeBucket(name, "");
};
