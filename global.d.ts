export interface IEnv {
  /** 时区 */
  TZ: string;
  /** 服务端口号 */
  PORT: string;
  /** 服务主机 */
  HOST: string;
  /** abstract.com key */
  ABSTRACT_API_KEY: string;
  /** abstract.com 域名 */
  ABSTRACT_API_DOMAIN: string;
  /** rapidapi.com key */
  RAPIDAPI_API_KEY: string;
  /** rapidapi.com 域名 */
  RAPIDAPI_API_DOMAIN: string;
  /** MYSQL(public) 用户 */
  MYSQL_PUBLIC_USER: string;
  /** MYSQL(public) 地址 */

  MYSQL_PUBLIC_HOST: string;
  /** MYSQL(public) 密码 */
  MYSQL_PUBLIC_PASSWORD: string;
  /** REDIS(public) 地址 */
  REDIS_PUBLIC_HOST: string;
}

/** 拓展`global`属性 */
declare global {
  namespace NodeJS {
    /** 拓展环境变量声明 */
    interface ProcessEnv extends IEnv {}
  }
}
