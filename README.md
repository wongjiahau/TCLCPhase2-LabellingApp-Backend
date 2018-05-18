# TCLCPhase2-LabellingApp-Backend
## How it works?
It works by launching two docker containers
- node REST API server
- mongo server

## How to run development environment?

```bash
./init-containers.sh --skip-curl
```
You need to mention `--skip-curl` option so that it won't download the latest dataset (which is time consuming).

## How to run test?

```bash
./init-containers.sh --skip-curl
docker exec -it mynode /bin/bash -c 'npm test'
```

## How to deploy?

```bash
# SSH into desired server
# Install Docker
# Install docker-compose
cd ~
git clone https://github.com/wongjiahau/TCLCPhase2-LabellingApp-Backend.git
cd TCLCPhase2-LabellingApp-Backend
./init-containers.sh
```

# How to reset pending post?
```bash
./resetAllPendingPost.sh
```

## How to query current status?
```
docker exec -it mongo /bin/bash
mongo
db.english.find({semantic_value: "positive"}).count();
db.english.find({semantic_value: "negative"}).count();
db.english.find({semantic_value: "neutral"}).count();
db.chinese.find({semantic_value: "positive"}).count();
db.chinese.find({semantic_value: "negative"}).count();
db.chinese.find({semantic_value: "neutral"}).count();
```

## How to enable port 3000 on Google Compute Engine
Go to https://stackoverflow.com/questions/21065922/how-to-open-a-specific-port-such-as-9090-in-google-compute-engine

Use `target` as `http-server`.