import COS from "cos-nodejs-sdk-v5";
const cos = new COS({
    SecretId: process.env.SecretId,
    SecretKey: process.env.SecretKey,
});
