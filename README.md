```
npm install
npm run dev
```

```
open http://localhost:3000
```

@trend https://npmtrends.com/mariadb-vs-mysql-vs-mysql2-vs-oracledb-vs-sqlite3-vs-tedious

https://hono.dev/docs/getting-started/basic#return-json
https://sidorares.github.io/node-mysql2/zh-CN/docs
https://orm.drizzle.team/docs/select

https://zhuanlan.zhihu.com/p/705466009

日志
分库分表

Why not controller
https://hono.dev/docs/guides/best-practices#don-t-make-controllers-when-possible

FAQ

```bash
[TypeError] fetch failed TypeError: fetch failed
  at node:internal/deps/undici/undici:12502:13
```

如果调用 fetch 方法失败并报错如上，请检查你的 node 版本是否和系统匹配（如果你使用 arm64 架构的 mac，请使用 arm64 版本的 node，Rosetta 2 转译的 intel 版本的 node 可能会有问题）
