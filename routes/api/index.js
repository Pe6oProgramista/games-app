const {Router} = require('express');
const path = require('path');

const { logErrors, apiFinalHandler, apiNotFoundHandler } = require('../../errorHandlers');
const { renderWithLayout } = require('../../utils');
const authRouter = require('./authRouter');
const usersRouter = require('./usersRouter');

const apiRouter = new Router();



module.exports = apiRouter;



apiRouter.use('/auth', authRouter);
apiRouter.use('/users', usersRouter);

// apiRouter.get('/games/:id', (req, res) => {
//     res.sendFile(path.resolve('./public/js/games/game.' + req.params.id + '.js'));
// });

// apiRouter.get('/zzz', (req, res) => {
//     renderWithLayout(res, 'zzz', 'ZZZ');
// });

apiRouter.use(apiNotFoundHandler);
apiRouter.use(logErrors);
apiRouter.use(apiFinalHandler);
