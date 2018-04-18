# TCLCPhase2-LabellingApp-Backend

## How to run development environment?

```bash
./init-containers.sh
```

## How to run test?

```bash
./init-containers.sh
docker exec -it mynode /bin/bash -c 'npm test'
```

## How to up the server?

```bash
# This is outdated currently
./run_forever.sh
```

# How to reset pending post?

```bash
sudo docker exec -it mymongo /usr/bin/mongo
use tclc
db.english.find({semantic_value: "pending"}).count();
db.chinese.find({semantic_value: "pending"}).count();
db.english.updateMany({semantic_value: "pending"}, {$set: {semantic_value: "unassigned"}});
db.chinese.updateMany({semantic_value: "pending"}, {$set: {semantic_value: "unassigned"}});

```