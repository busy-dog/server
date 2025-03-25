export interface IEnv {
  /** 时区 */
  TZ: string;
  /** 服务端口号 */
  PORT: string;
  /** 服务主机 */
  HOST: string;
  /** AES 密钥 */
  AES_KEY: string;

  /** POSTGRESQL(public) 是否启用SSL */
  POSTGRESQL_SSL?: string;
  /** POSTGRESQL(public) 用户 */
  POSTGRESQL_USER: string;
  /** POSTGRESQL(public) 地址 */
  POSTGRESQL_HOST: string;
  /** POSTGRESQL(public) 端口 */
  POSTGRESQL_PORT: string;
  /** POSTGRESQL(public) 密码 */
  POSTGRESQL_PASSWORD: string;
  /** POSTGRESQL(public) 数据库 */
  POSTGRESQL_DATABASE: string;

  /** REDIS(public) 是否启用TLS */
  REDIS_TLS?: string;
  /** REDIS(public) 地址 */
  REDIS_HOST: string;
  /** REDIS(public) 端口 */
  REDIS_PORT?: string;
  /** REDIS(public) 密码 */
  REDIS_PASSWORD?: string;
  /** REDIS(public) 集群 */
  REDIS_CLUSTER?: string;

  /** Google 客户端ID */
  GOOGLE_CLIENT_ID: string;
  /** Google 客户端密钥 */
  GOOGLE_CLIENT_SECRET: string;

  /** Github mango ID */
  GITHUB_CLIENT_ID: string;
  /** Github mango 密钥 */
  GITHUB_CLIENT_SECRET: string;

  /** AWS S3 桶 */
  AWS_S3_BUCKET?: string;
}

/** 拓展`global`属性 */
declare global {
  namespace NodeJS {
    /** 拓展环境变量声明 */
    interface ProcessEnv extends IEnv {}
  }
}
