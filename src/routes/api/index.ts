import { Router }from 'express';
import * as path from 'path';

import { logErrors, apiFinalHandler, apiNotFoundHandler } from '../../errorHandlers';
import { renderWithLayout }from '../../utils';
import authRouter from './authRouter';
import usersRouter from './usersRouter';

const apiRouter = Router();

export default apiRouter;


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
