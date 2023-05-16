echo "注入测试字体"
# HOST="http://localhost:3000"

find ./data/fonts -type f -name '*.ttf' -exec curl -X POST -H "Content-Type: multipart/form-data" -F "font=@{}" "${HOST}/fonts" \; 

echo "开始进行第一个文件切割，大概需要几十秒"
curl -N  -F "id=1" -F "md5=daf00ca6691141c1508ef912397947f4" ${HOST}/split