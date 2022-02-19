import { QueryResult } from "pg";
import bcrypt from 'bcrypt';
import * as jwt from '../../jwt';
import { IUserAttr, IUserCreationAttr, IUserInstanceMethods } from "../../interfaces/models/user";
import { UserPerm } from "../../enums";
import { pool } from "../pool";
import { IScoreAttr } from "../../interfaces/models/score";
import { IScoreInstance } from "./score";

type UserScores = { user: IUserInstance, scores: IScoreInstance[] };

export class User {

    // type A = (IUserInstance & IScoreAttr[])
    //transaction: https://stackoverflow.com/questions/66138268/express-postgres-user-registration-controller
    //             https://github.com/brianc/node-postgres-docs/blob/40393b80440b85d26302a538790c66ff9f7076cb/content/features/4-transactions.mdx


    // username max 30 chars
    // email max 40 chars
    // password max 60 chars
    static insert(user: IUserCreationAttr): Promise<IUserInstance | undefined> {
        const query = {
            text: `insert into app.users (username, email, password ${user.permissions? ', permissions' : ''}) values ($1, $2, $3 ${user.permissions? ', $4' : ''}) returning *`,
            values: user.permissions?
                [user.username, user.email, user.password, user.permissions] :
                [user.username, user.email, user.password]
        }

        return pool.query(query)
        .then(res => {
            if(res.rowCount == 0) return undefined

            return new IUserInstance(res.rows[0].id,
                res.rows[0].created_at,
                res.rows[0].updated_at,
                res.rows[0].username,
                res.rows[0].password,
                res.rows[0].email,
                res.rows[0].permission); //  UserPerm.Basic
        })
        .catch(err => {
            console.error('Error running insert query', err.stack);
            throw err;
        });
    }

    static exists(username: string): Promise<boolean> { //IUserInstance
        const query = {
            text: 'select * from app.users where username = $1',
            values: [username]
        }
        return pool.query(query)
        .then(res => {
            return res.rowCount > 0;
            // return new IUserInstance(res.rows[0].id,
            //     res.rows[0].created_at,
            //     res.rows[0].updated_at,
            //     res.rows[0].username,
            //     res.rows[0].password,
            //     res.rows[0].email,
            //     res.rows[0].permission);
            // return res;
            // return new IUserInstance(5, new Date(), new Date(), "dsd", "dsd", "dsd", UserPerm.Basic);
        })
        .catch(err => {
            console.error('Error running user check query', err.stack);
            throw err;
        });
    }

    static authenticate(identifier: string, password: string): Promise<number | string | undefined> {
        const query = {
            text: 'select * from app.users where (username = $1 or email = $1)',
            values: [identifier]
        }
        
        return pool.query(query)
        .then((results): Promise<number | string | undefined> => {
            if(results.rowCount == 0) {
                return Promise.resolve(401);
            }
            
            if(!results.rows[0].password) return Promise.resolve(500);

            return bcrypt.compare(password, results.rows[0].password)
            .then((same): Promise<number | string | undefined> => {
                if(!same) return Promise.resolve(401);
                
                const {password, ...payload} = results.rows[0];
                return jwt.createToken(payload);
		    });
        })
        .catch(err => {
            console.error('Error running authentication query', err.stack);
            throw err;
        });
    }

    static existsId(id: number): Promise<boolean> {
            const query = {
                text: 'select * from app.users where (id = $1)',
                values: [id]
            }

            return pool.query(query)
            .then((results) : boolean => {
                if(results.rowCount == 0) {
                    return false;
                }
                return true;
            })
            .catch(err => {
                console.error('Error running validation query', err.stack);
                throw err;
            });
    }

    static findAll(): Promise<IUserInstance[]> {
        const query = {
            text: 'select * from app.users',
            values: []
        }
        
        return pool.query(query)
        .then(res =>
            res.rows.map(r => new IUserInstance(r.id, r.created_at, r.updated_at, r.username, r.password, r.email, r.permissions)))
        .catch(err => {
            console.error('Error running findAll query', err.stack);
            throw err;
        });
    }

    static findByPk(id: number, withScores: boolean): Promise<IUserInstance | UserScores | undefined> {
        let query = {
            text: 'select * from app.users where id = $1',
            values: [id]
        }

        if(withScores) {
            query.text = 'select\
                            app.users.*,\
                            row_to_json(app.scores.*) as scores\
                        from app.scores inner join app.users on app.scores.user_id = app.users.id where app.users.id = $1'
        }
        
        return pool.query(query)
        .then(res => {
            if(res.rowCount == 0) {
                return undefined;
            } else {
                let user = new IUserInstance(
                    res.rows[0].id,
                    res.rows[0].created_at,
                    res.rows[0].updated_at,
                    res.rows[0].username,
                    res.rows[0].password,
                    res.rows[0].email,
                    res.rows[0].permissions
                );

                if(withScores) {
                    let us: UserScores = {user, scores: []}
                    res.rows.forEach(r => {
                        us.scores.push(new IScoreInstance(
                            r.scores.id,
                            r.scores.created_at,
                            r.scores.updated_at,
                            r.scores.user_id,
                            r.scores.game_id,
                            r.scores.score
                        ))
                    })
                    return us;
                } else {
                    return user
                }
            } })
        .catch(err => {
            console.error('Error running findByPk query', err.stack);
            throw err;
        });
    }
}

export class IUserInstance implements IUserAttr, IUserInstanceMethods {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    password: string;
    email: string;
    permissions: UserPerm;

    constructor(id: number,
                createdAt: Date,
                updatedAt: Date,
                username: string,
                password: string,
                email: string,
                permissions: UserPerm) {
        
        this.id = id;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.username = username;
        this.password = password;
        this.email = email;
        this.permissions = permissions;
    }
    
    comparePasswords(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    };

    // getPosts: HasManyGetAssociationsMixin<IPostModelInstance>;
    // setPosts: HasManySetAssociationsMixin<IPostModelInstance, number>;
    // addPost: HasManyAddAssociationMixin<IPostModelInstance, number>;
}

// beforeSave(instance: IUserModelInstance) {
//     if (instance.previous('password') === instance.password) { return Promise.resolve(); }
//     return bcrypt.genSalt(10).then(salt => bcrypt.hash(instance.password, salt)).then(hashedPassword => {
//     instance.password = hashedPassword;
//     });
// }