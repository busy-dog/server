export interface IEnv {
  /** 时区 */
  TZ: string;
  /** 服务端口号 */
  PORT: string;
  /** 服务主机 */
  HOST: string;
  /** MYSQL(public) 用户 */
  MYSQL_PUBLIC_USER: string;
  /** MYSQL(public) 地址 */

  MYSQL_PUBLIC_HOST: string;
  /** MYSQL(public) 密码 */
  MYSQL_PUBLIC_PASSWORD: string;
  /** REDIS(public) 地址 */
  REDIS_PUBLIC_HOST: string;

  /** Github mango ID */
  GITHUB_CLIENT_ID: string;
  /** Github mango 密钥 */
  GITHUB_CLIENT_SECRET: string;
}

/** 拓展`global`属性 */
declare global {
  namespace NodeJS {
    /** 拓展环境变量声明 */
    interface ProcessEnv extends IEnv {}
  }
}
