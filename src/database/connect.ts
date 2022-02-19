import { pool } from "./pool";
// import { models } from './models';


export function connect(): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
        pool.query('SELECT $1::text as message', ['Pool connection established!'], (err, res) => {
            if(err) return void reject(err);
            resolve(res.rows[0].message);
        })
    });
};

