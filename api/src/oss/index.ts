import Minio from "minio";

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_POINT!,
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ROOT_USER!,
    secretKey: process.env.MINIO_ROOT_PASSWORD!,
});

/** 初始化 MINIO  */
export const initMinio = async () => {
    await ensureBucket("user-fonts");
    await ensureBucket("result-fonts");
};

export const ensureBucket = async (name: string) => {
    const isExist = await minioClient.bucketExists(name);
    if (!isExist) {
        console.log("重新构建 MINIO ", name);
        await minioClient.makeBucket(name, "");

        await minioClient.setBucketPolicy(
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
};
