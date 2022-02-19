import { Router } from 'express';
import * as utils from '../utils';
import * as jwt from '../jwt';
import  { logErrors, finalHandler, notFoundHandler } from '../errorHandlers';
import { models } from '../database/models';

const indexRouter = Router();

export default indexRouter;


indexRouter.get('/', (req, res) => {
    res.render('pages/home');
    // utils.renderWithLayout(res, 'home', 'Games app');
});

indexRouter.get('/signin', utils.notAuth, (req, res) => {
    // res.type('html');
    // res.header("Content-Type",'text/html');
    res.render('pages/signin');
    // utils.renderWithLayout(res, 'signin', 'Games app');
});

indexRouter.get('/signup', utils.notAuth, (req, res) => {
    res.render('pages/signup')
    // utils.renderWithLayout(res, 'signup', 'Games app');
});

indexRouter.get('/about', (req, res) => {
    res.render('pages/about')
    // utils.renderWithLayout(res, 'about', 'Games app');
});

indexRouter.get('/games', async (req, res) => {
    const token = req.cookies['auth-cookie'];
    const uid = await jwt.verify(token)
    .then((user) => {
        return (<any>user).id;
    })
    .catch(err => {
        return undefined;
    })
    models.Game.findAll().then(games => {
        Promise.all(games.map(g => g.getScores())).then(result => {
            let locals = { games: result.map(gameScores => ({
                    id: gameScores.game.id,
                    name: gameScores.game.name,
                    hScore: (() => {
                        let curr_score = gameScores.us.filter(usEntry => usEntry.user.id === uid)[0];
                        if(uid === undefined || curr_score === undefined) return 0;
                        else return curr_score;
                    })()
                }))
            }
            console.log(locals.games[0].hScore)
            res.render('pages/games', locals)
        })
    })
});

indexRouter.get('/leaderboard', (req, res) => {
    // models.Game.findAll  , {games}  games: {name, us: {user, score}}
    models.Game.findAll().then(games => {
        Promise.all(games.map(g => g.getScores())).then(result => {
            res.render('pages/leaderboard', { games: result.map(gameScores => ({
                    name: gameScores.game.name,
                    us: gameScores.us.map(usEntry => ({
                        user: usEntry.user.username,
                        score: usEntry.score.score})
                    ) })
                )
            })
        })
    })
    // utils.renderWithLayout(res, 'games', 'Games app');
});

indexRouter.use(notFoundHandler);
indexRouter.use(logErrors);
indexRouter.use(finalHandler);