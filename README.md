# font-server

## 软件定位

font-server 为内网使用的 **字体存储、管理服务**。功能描述如下：

1. ✅ 用户上传原始字体，内部存储原始字体
2. ✅ 触发切割功能 -> 切割服务器自动获取内部文件并开始切割 -> 存入内部文件系统
3. 切割完成事件 -> 外部的监听程序 -> 获取内部的切割分片 -> 部署到外部公开的 OSS 系统上
    1. 内外 OSS 系统应该使用同一路径
4. 用户通过 OSS 系统提供的文件 CDN 加速，嵌入字体加载 HTML 片段 -> 浏览器自动加载 CSS 文件和字体文件

## 软件设计

1. API Server
    1. 采用 Nodejs Typescript Koa 框架构建 Restful API 提供给系统外部使用
    2. 字体切割服务，暂时采用同一个服务器进行服务
2. 数据库：
    1. 使用 Docker 容器中的 Postgres，不直接进行操作
    2. 通过 Nodejs TypeORM 框架存储一些基本数据即可
3. MINIO 文件系统：
    1. 备份用户字体
    2. 存储切割字体分片
    3. 通过 Web Hook 通知 外部更新

# 快速测试

1. **clone 本仓库** OR **fork 它并打开 Github Workspace**

2. 下载测试文件（可跳过）

```bash
sudo sh scripts/downloadFonts.sh # 需要 linux 环境 curl unzip
```

2. 在根目录运行

```sh
docker-compose up -d
```

3. VSCode 安装 Thunder Client
4. VSCode 设置中打上 Thunder Client 的 save to workspace 勾，然后重启就可以看到我之前的请求测试
