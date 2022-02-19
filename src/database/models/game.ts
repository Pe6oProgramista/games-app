import { QueryResult } from "pg";
import { UserPerm } from "../../enums";
import { IGameAttr, IGameInstanceMethods } from "../../interfaces/models/game";
import { pool } from "../pool";
import { IScoreInstance } from "./score";
import { IUserInstance } from "./user";

type GameScores = { game: IGameInstance, us: {user: IUserInstance, score: IScoreInstance}[] };

export class Game {
    // name max 30 chars
    static insert(name: string): Promise<IGameInstance | undefined> {
        const query = {
            text: 'insert into app.games (name) values ($1) returning *',
            values: [name]
        }
        return pool.query(query)
        .then(res => {
            if(res.rowCount == 0) return undefined;

            return new IGameInstance(
                res.rows[0].id,
                res.rows[0].created_at,
                res.rows[0].updated_at,
                res.rows[0].name
            )
        })
        .catch(err => {
            console.error('Error running insert query', err.stack);
            throw err;
        });
    }

    static findAll(): Promise<IGameInstance[]> {
        const query = {
            text: 'select * from app.games',
            values: []
        }
        
        return pool.query(query)
        .then(data => data.rows.map(r => new IGameInstance(
            r.id,
            r.created_at,
            r.updated_at,
            r.name)
        ))
        .catch(err => {
            console.error('Error running findAll query', err.stack);
            throw err;
        });
    }
}

export class IGameInstance implements IGameAttr, IGameInstanceMethods {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;

    constructor(id: number,
                createdAt: Date,
                updatedAt: Date,
                name: string) {
        
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.name = name;
    }

    getScores(): Promise<GameScores> {
        let query = {
            text: 'select\
                app.games.*,\
                row_to_json(app.users.*) as user,\
                row_to_json(app.scores.*) as score\
                from app.games inner join app.scores on app.games.id = app.scores.game_id\
                inner join app.users on app.users.id = app.scores.user_id\
                where app.games.id = $1\
                order by app.scores.score desc, app.users.username asc',
            values: [this.id]
        }

        return pool.query(query)
        .then(data => ({
            game: this,
            us: data.rows.map(r => ({
                user: new IUserInstance(
                    r.user.id,
                    r.user.created_at,
                    r.user.updated_at,
                    r.user.username,
                    r.user.password,
                    r.user.email,
                    r.user.permissions),
                score: new IScoreInstance(
                    r.score.id,
                    r.score.created_at,
                    r.score.updated_at,
                    r.score.user_id,
                    r.score.game_id,
                    r.score.score
                )
            }))
        }))
        .catch(err => {
            console.error('Error running getScores query', err.stack);
            throw err;
        });
    }
}