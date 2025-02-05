#!/bin/bash
pnpm drizzle

# 使用 dotenvx 加载 .env 文件
export $(dotenvx get --format=shell)

# 从 .env 文件获取 MySQL 版本和密码
MYSQL_USER=${MYSQL_PUBLIC_USER}
MYSQL_HOST=${MYSQL_PUBLIC_HOST}
MYSQL_PASSWORD=${MYSQL_PUBLIC_PASSWORD}
MYSQL_VERSION=${MYSQL_PUBLIC_VERSION:-8} # MySql 默认版本为 8
MYSQL_DATABASE=${MYSQL_PUBLIC_DATABASE:-common} # 默认数据库为 common

REDIS_VERSION=${REDIS_PUBLIC_VERSION:-7} # Redis 默认版本为 7

DOCKER_VOLUMES=${DOCKER_PUBLIC_VOLUMES:-~/Volumes} # 默认卷为 '~/Volumes'

if [ -z "$MYSQL_PASSWORD" ]; then
  echo "Error: MYSQL_PUBLIC_PASSWORD is not set in the .env file"
  exit 1
fi

# 检查是否存在 mysql 容器
if docker ps -a | grep -q "mango-server-mysql"; then
  # 停止并删除 mysql 容器
  docker stop mango-server-mysql
  docker rm mango-server-mysql
fi

# 执行 Docker run 命令，启动 MySQL 容器
docker run --name mango-server-mysql \
  --network host \
  -e MYSQL_ROOT_PASSWORD="$MYSQL_PASSWORD" \
  -e MYSQL_DATABASE="$MYSQL_DATABASE" \
  -v $DOCKER_VOLUMES/mysql:/var/lib/mysql \
  -d mysql:$MYSQL_VERSION --bind-address=0.0.0.0

# 等待 MySQL 容器启动后，初始化数据库
sleep 1
docker exec -it mango-server-mysql mysql -u $MYSQL_USER -h "$MYSQL_HOST" -p$MYSQL_PASSWORD -e "CREATE DATABASE IF NOT EXISTS common;"

# 从 drizzle 生成 库表结构 并迁移到目标数据库
pnpm drizzle-kit generate && pnpm drizzle-kit migrate

# 检查是否存在 redis 容器
if docker ps -a | grep -q "mango-server-redis"; then
  # 停止并删除 redis 容器
  docker stop mango-server-redis
  docker rm mango-server-redis
fi

# 执行 Docker run 命令，启动 Redis 容器
docker run --name mango-server-redis \
  --network host \
  -v $DOCKER_VOLUMES/redis:/data \
  -d redis:$REDIS_VERSION

# 执行种子数据
pnpm seed
