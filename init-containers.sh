#!/bin/bash
if [ $1 = "--skip-curl" ]; then
    echo "Skipping curling datasets"
else
    curl https://raw.githubusercontent.com/fesvictor/TCLCPhase2/master/analysis/transform_format_for_mongodb/chinese.json > './dockerfiles/database/data/chinese.json'
    curl https://raw.githubusercontent.com/fesvictor/TCLCPhase2/master/analysis/transform_format_for_mongodb/english.json > './dockerfiles/database/data/english.json'
fi
docker-compose stop
docker-compose build
docker-compose up -d
docker exec mymongo mongoimport --db test --collection english --drop --file /usr/data/english_sample.json --jsonArray
docker exec mymongo mongoimport --db test --collection chinese --drop --file /usr/data/chinese_sample.json --jsonArray
docker exec mymongo mongoimport --db tclc --collection english --drop --file /usr/data/english.json --jsonArray
docker exec mymongo mongoimport --db tclc --collection chinese --drop --file /usr/data/chinese.json --jsonArray
