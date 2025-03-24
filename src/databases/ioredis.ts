import Redis from 'ioredis';
import { isString } from 'remeda';
import { compact, ensure } from 'src/utils';

const {
  REDIS_TLS: isTLS,
  REDIS_HOST: host,
  REDIS_CLUSTER: cluster,
  REDIS_PASSWORD: password,
  REDIS_PORT: port = '6379',
} = process.env;

// TODO 重写 sendCommand 方法 以实现自定义 Logger
// https://github.com/redis/ioredis/issues/719
// const { sendCommand } = Redis.prototype
// Redis.prototype.sendCommand = function (...args) {
//   const [command] =args;
//   console.log(command.name);
//   sendCommand.apply(this, args);
// }

const tls = ensure(isTLS === 'true' && { rejectUnauthorized: false });

export const redis = compact([
  isString(cluster) &&
    new Redis.Cluster([{ host: cluster, port: Number(port) }], {
      // 启用准备检查
      enableReadyCheck: true,
      // 槽位刷新超时
      slotsRefreshTimeout: 2000,
      enableAutoPipelining: true,
      dnsLookup: (arg, cb) => cb(null, arg),
      redisOptions: { tls },
    }),
  !isString(cluster) &&
    new Redis({
      tls,
      host,
      db: 0,
      password,
      port: Number(port),
      enableReadyCheck: true,
      enableAutoPipelining: true,
    }),
]);
