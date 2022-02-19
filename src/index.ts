import express  from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';

import env from './envConfig';

import apiRouter from './routes/api';
import indexRouter from './routes/indexRouter';
import { flashAll } from './flashMessages';
import { connect } from './database/connect';
import { models } from './database/models';
import { setAuthLocal } from './utils';

const app = express();

// dev
app.set('etag', false)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.set( 'views', path.resolve('views') );
app.set('view engine', 'ejs'); // app.set('views','views');
// app.set('layout', './layout');
app.use( '/static', express.static('public', {index: false}) );
app.use(express.json()); // for json-like request body
app.use(express.urlencoded({extended: true})); // for urlencoded requests like default form submit
app.use(cookieParser(env.COOKIE_SECRET || 'dsadasdsadsada'));

// app.use(utils.strictRender);
app.use(flashAll);
app.use(setAuthLocal);
app.use('/api', apiRouter);
app.use('/', indexRouter);

// // 500
// app.use((err, req, res, next) => {
//   let a = next();
//   if (err.message.includes('jwt')) {
//     return void res
//       .clearCookie('auth-cookie')
//       .sendStatus(401)
//       // .status(401)
//       // .send({ message: 'Unauthenticated' });
//   }
//   if (err.message === 'not found') {
//     return void res.status(404).send({ message: 'Not found' });
//   }
//   console.error('Final error', err.stack);
//   return void res.status(500).send({ message: 'Server error!' });

//   // res.status(500)
//   // utils.renderWithLayout(res, 'error', 'Error', { error: err })
// });

app.on('ready', function() {
  app.listen(env.PORT || 3000, env.HOST || 'localhost', () => {
    console.log(`Server is listening on http://${env.HOST}:${env.PORT}`);
  });

  // models.Game.insert('game.0');
  // models.Game.insert('game.1');
  // models.Game.insert('game.2');
});

connect().then(msg => {
  console.log(msg);
  app.emit('ready');
}).catch(err => console.error('Database connection ERROR:', err.stack))
.then();