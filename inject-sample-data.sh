#!/bin/bash
docker exec mymongo mongoimport --db test --collection english --drop --file /usr/data/english_sample.json --jsonArray
