# font-server

## 软件定位

font-server 为内网使用的 **字体存储、管理服务**，通过 WebHook 对外通知信息，外部可以通过程序端口进行内部数据访问。功能描述如下：

1. ✅ 用户上传原始字体，内部存储原始字体
2. ✅ 触发切割功能 -> 切割服务器自动获取内部文件并开始切割 -> 存入内部文件系统
3. ✅ WebHook 订阅 > 触发 hook 事件 > 广播订阅 url
4. 切割完成事件 -> 外部的监听程序 -> 获取内部的切割分片 -> 部署到外部公开的 OSS 系统上
    1. 内外 OSS 系统应该使用同一路径
5. 用户通过 OSS 系统提供的文件 CDN 加速，嵌入字体加载 HTML 片段 -> 浏览器自动加载 CSS 文件和字体文件

## 软件设计

1. API Server
    1. 采用 Nodejs Typescript Koa 框架构建 Restful API 提供给系统外部使用
    2. 字体切割服务，暂时采用同一个服务器进行服务
    3. 通过 Web Hook 通知外部更新
2. 数据库：
    1. 使用 Docker 容器中的 Postgres，不直接进行操作
    2. 通过 Nodejs TypeORM 框架存储一些基本数据即可
3. MINIO 文件系统：
    1. 使用 SDK 操作 MINIO 容器
    2. 备份用户字体
    3. 存储切割字体分片
4. Webhook 事件派发机制
    1. 通过请求添加外部服务器的 url 到事件监听表中
    2. 当系统内部触发事件时，向监听的 url 发送包裹事件内部的 json 数据
    3. 外部系统进行事件操作

# 快速测试

1. **clone 本仓库** OR **fork 它并打开 Github Workspace**

2. 在根目录运行

```sh
docker-compose up -d
```

## 半自动测试

1. 自动下载测试字体文件

```bash
sudo sh scripts/init.sh # 需要 linux 环境 curl unzip
```

2. 自动注入基本测试数据

```sh
sudo sh scripts/injectFonts.sh
```

3. VSCode 安装 Thunder Client
4. VSCode 设置中打上 Thunder Client 的 save to workspace 勾，然后重启就可以看到我之前的请求测试
