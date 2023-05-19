# Font Server Pusher

这是 Font Server 的数据同步推送服务器，通过检查机制和推送机制将 Font Server 系统中的文件同步到远程的云存储中。

由于云存储部署方式不同，我们提供了不同的 adapter 方式帮助你接入到各个厂商的云存储系统中，并自动运行同步操作。已经接入：

1. ✅ 腾讯云 COS

## 使用指南

### 定义环境变量

环境变量分为 font-server 后台的一些服务和 Adapter 层需要填写的信息

```sh

WEBHOOK_HOST=http://localhost:3000
MINIO_HOST=http://localhost:9000
PORT=3001

SecretId=
SecretKey=
Bucket=
Region=ap-nanjing




```

### 编写入口代码

```js
import { PusherCore, COSAdapter } from "@konghayao/font-server-pusher";

const core = new PusherCore(
    new COSAdapter(
        {
            SecretId: process.env.SecretId,
            SecretKey: process.env.SecretKey,
        },
        {
            Bucket: process.env.Bucket,
            Region: process.env.Region,
            WEBHOOK_HOST: process.env.WEBHOOK_HOST,
            MINIO_HOST: process.env.MINIO_HOST,
        }
    ),
    { port: process.env.PORT ? parseInt(process.env.PORT) : 3001 }
);
core.run();
```
