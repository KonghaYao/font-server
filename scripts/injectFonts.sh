echo "注入测试字体"
HOST="http://localhost:3000"
find ./data/fonts -type f -name '*.ttf' -exec curl -X POST -H "Content-Type: multipart/form-data" -F "font=@{}" -F "name=test" "${HOST}/fonts" \;