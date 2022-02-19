import { Router } from 'express';
import { models } from '../../database/models';
import * as jwt from '../../jwt';

const userRouter = Router();

export default userRouter;


//GET ALL
userRouter.get('/', (req, res, next) => {
    // res.send(res.locals.users);
    models.User.findAll().then(users => {
        res.send(users);
    }).catch(next);
});

//GET BY ID
userRouter.get('/:id', (req, res, next) => {
    // res.send(res.locals.users.find(u => u.id === +req.params.id));
    const withScores = req.query.include === 'scores'
    models.User.findByPk(+req.params.id, withScores).then(user => {
      res.send(user);
    }).catch(next);
});

userRouter.get('/:id/scores/:game_id', (req, res, next) => {
    const token = req.cookies['auth-cookie'];
    jwt.verify(token)
    .then((user) => {
        const uid = (<any>user).id;
        if(req.params.id !== 'current' && req.params.id !== uid
          || Number.isNaN(+req.params.game_id)) {
            return void res.end();
        }
        models.Score.findByPk(uid, +req.params.game_id)
        .then(scoreRecord => {
            if(scoreRecord === undefined) {
                res.send({ body: {noRecord: true} })
            }else {
                res.send({ body: {score: scoreRecord.score, noRecord: false} })
            }
        })
    })
    .catch(next)
});

userRouter.post('/:id/scores/:game_id', (req, res, next) => {
    const token = req.cookies['auth-cookie'];
    jwt.verify(token)
    .then((user) => {
        const uid = (<any>user).id;
        if(req.params.id !== 'current' && req.params.id !== uid
          || Number.isNaN(+req.params.game_id)) {
            return void res.end();
        }
        models.Score.update(uid, +req.params.game_id, models.Score.INIT_VAL)
        .then(scoreRecord => {
            res.send({ body: {score: models.Score.INIT_VAL} })
        })
    })
    .catch(next)
});

userRouter.put('/:id/scores/:game_id', (req, res, next) => {
    const token = req.cookies['auth-cookie'];
    jwt.verify(token)
    .then((user) => {
        const uid = (<any>user).id;
        if(req.params.id !== 'current' && req.params.id !== uid
          || Number.isNaN(+req.params.game_id)) {
            return void res.end();
        }
        console.log('hScore', req.body)
        models.Score.forceInsert(uid, +req.params.game_id, req.body.highScore)
        .then(updateStatus => {
            res.send({ body: {success: updateStatus} })
        })
    })
    .catch(next)
    // const { firstName, lastName } = req.body;
    // const user = res.locals.users.find(u => u.id === +req.params.id)
    // user.firstName = firstName;
    // user.lastName = lastName;

    // res.send(user);
});

//UPDATE
userRouter.put('/:id', (req, res) => {
    // const { firstName, lastName } = req.body;
    // const user = res.locals.users.find(u => u.id === +req.params.id)
    // user.firstName = firstName;
    // user.lastName = lastName;

    // res.send(user);
});

//CREATE
userRouter.post('/', (req, res) => {
    // const { firstName, lastName } = req.body;

    // res.locals.users.push({
    //     id: res.locals.users.length + 1,
    //     firstName,
    //     lastName
    // });

    // res.send(res.locals.users[res.locals.users.length - 1]);
});

//DELETE
userRouter.delete('/:id', (req, res) => {

    // const {id} = req.params;
    // res.locals.users = res.locals.users.filter(u => u.id !== Math.floor(Math.random() * 11));

    // res.send(`User with ${id} was deleted.`);
});