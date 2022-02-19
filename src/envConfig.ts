import path from 'path';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

const configOut = dotenv.config({multiline: true, path: path.resolve('.env') });
dotenvExpand.expand(configOut);

interface _ENV {
  // NODE_ENV: string | undefined;
  readonly HOST?: string;
  readonly PORT?: number;
  
  readonly DB_USER?: string;
  readonly DB_PASSWORD?: string;
  readonly DB_HOST?: string;
  readonly DB_PORT?: number;
  readonly DB_NAME?: string;
  readonly DB_URI?: string;
  
  readonly COOKIE_SECRET? : string;
  readonly JWT_SECRET? : string;
  readonly AUTH_TIME_IN_DAYS?: number;
  readonly SALT_ROUNDS? : number;
}

type ENV = Required<_ENV>;

const _getConfig = (): _ENV => {
  return {
    // NODE_ENV: process.env.NODE_ENV,
    HOST: process.env.HOST,
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
    
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    DB_NAME:process.env.DB_NAME,
    DB_URI: process.env.DB_URI,
    
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    AUTH_TIME_IN_DAYS: process.env.AUTH_TIME_IN_DAYS ? Number(process.env.AUTH_TIME_IN_DAYS) : undefined,
    SALT_ROUNDS: process.env.SALT_ROUNDS ? Number(process.env.SALT_ROUNDS) : undefined,
  };
};

const getConfig = (config: _ENV): ENV => {
  for (const [key, value] of Object.entries(config)) {
    if (value == undefined) {
      throw new Error(`Missing key ${key} in .env`);
    }
  }
  return config as ENV;
};

const _env = _getConfig();

const env = getConfig(_env);

export default _env;

