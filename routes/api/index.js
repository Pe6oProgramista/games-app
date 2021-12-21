const {Router} = require('express');
const { logErrors, apiFinalHandler, apiNotFoundHandler } = require('../../errorHandlers');
const authRouter = require('./authRouter');
const usersRouter = require('./usersRouter');

const apiRouter = new Router();



module.exports = apiRouter;



apiRouter.use('/auth', authRouter);
apiRouter.use('/user', usersRouter);

apiRouter.use(apiNotFoundHandler);
apiRouter.use(logErrors);
apiRouter.use(apiFinalHandler);
