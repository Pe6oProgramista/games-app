import { Pool, PoolConfig } from "pg";
import env from '../envConfig'

const db_config: PoolConfig = {
    // user: 'games_app_admin',
    // password: '123',
    // host: '127.0.0.1',
    // port: 5432,
    // database: 'games_app',
    connectionString: env.DB_URI || 'postgresql://games_app_admin:123@127.0.0.1:5432/games_app'
};

export const pool = new Pool(db_config);

export function endPool() {
    pool.end()
    .then(() => console.log('pool has ended'));
}