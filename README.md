# TCLCPhase2-LabellingApp-Backend

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
