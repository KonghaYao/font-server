cd ./api && npm install
cd ../notification && npm install
docker-compose up -d
cd ../
sh scripts/init.sh