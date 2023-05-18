import COS from "cos-nodejs-sdk-v5";
import dotenv from "dotenv";
import os from "os";
dotenv.config("./.env");
const cos = new COS({
    SecretId: process.env.SecretId,
    SecretKey: process.env.SecretKey,
});

const config = {
    Bucket: "fonts-1251037601",
    Region: "ap-nanjing",
};
