# TCLCPhase2-LabellingApp-Backend

## How to run development environment?

```bash
./init-containers.sh --skip-curl
```
You need to mention `--skip-curl` option so that it won't download the latest dataset (which is time consuming).

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
./resetAllPendingPost.sh
```
