import { QueryResult } from "pg";
import { IScoreAttr, IScoreInstanceMethods } from "../../interfaces/models/score";
import { pool } from "../pool";

export class Score {
    static get INIT_VAL() { return 0; }

    // user_id 8 bytes integer
    // game_id 8 bytes integer
    // score double 8 bytes, 15 decimal digits precision
    static insert(user_id: number, game_id: number, score: number): Promise<QueryResult<any>> {
        const query = {
            text: 'insert into app.scores (user_id, game_id, score) values ($1, $2, $3)',
            values: [user_id, game_id, score]
        }
        return pool.query(query)
        .catch(err => {
            console.error('Error running insert query', err.stack);
            throw err;
        });
    }

    static forceInsert(user_id: number, game_id: number, score: number): Promise<QueryResult<any>> {
        const query = {
            text: 'insert into app.scores (user_id, game_id, score) values($1, $2, $3)\
                    on conflict (user_id, game_id) do update set score = excluded.score',
            values: [user_id, game_id, score]
        }
        return pool.query(query)
        .catch(err => {
            console.error('Error running score\'s force insert query', err.stack);
            throw err;
        });
    }

    static update(user_id: number, game_id: number, score: number): Promise<boolean> {
        const query = {
            text: 'update app.scores set score = $3 where user_id = $1 and game_id = $2',
            values: [user_id, game_id, score]
        }
        return pool.query(query)
        .then(result => {
            return result.rowCount > 0;
        })
        .catch(err => {
            console.error('Error running score\'s update query', err.stack);
            throw err;
        });
    }

    static findByPk(user_id: number, game_id: number): Promise<IScoreInstance | undefined> {
        let query = {
            text: 'select * from app.scores where user_id = $1 and game_id = $2',
            values: [user_id, game_id]
        }

        return pool.query(query)
        .then(res => {
            if(res.rowCount == 0) {
                return undefined;
            } else {
                return new IScoreInstance(
                    res.rows[0].id,
                    res.rows[0].created_at,
                    res.rows[0].updated_at,
                    res.rows[0].user_id,
                    res.rows[0].game_id,
                    res.rows[0].score
                );
            }
        })
        .catch(err => {
            console.error('Error running score\'s findByPk query', err.stack);
            throw err;
        });
    }
}

export class IScoreInstance implements IScoreAttr, IScoreInstanceMethods {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    user_id: number;
    game_id: number;
    score: number;

    constructor(id: number,
                createdAt: Date,
                updatedAt: Date,
                user_id: number,
                game_id: number,
                score: number,) {
        
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.user_id = user_id;
        this.game_id = game_id;
        this.score = score;
    }
}