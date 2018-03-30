#!/bin/bash
docker-compose stop
docker-compose build
docker-compose up -d
docker exec mymongo mongoimport --db test --collection english --drop --file /usr/data/english_sample.json --jsonArray
docker exec mymongo mongoimport --db test --collection chinese --drop --file /usr/data/chinese_sample.json --jsonArray
