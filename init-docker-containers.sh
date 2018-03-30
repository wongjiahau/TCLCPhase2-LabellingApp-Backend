#!/bin/bash
docker-compose build
docker-compose up
docker exec mymongo mongoimport --db test --collection english --drop --file /usr/data/english_sample.json --jsonArray
docker exec mymongo mongoimport --db test --collection chinese --drop --file /usr/data/chinese_sample.json --jsonArray
