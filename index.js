const express = require('express');
const cookieParser = require('cookie-parser');

const jwt = require('./jwt');
const utils = require('./utils');
const db = require('./db');

const { indexRouter, usersRouter } = require('./api');
const { logErrors, errorHandler } = require('./errorHandlers');
const { flashAll } = require('./flashMessages');

const hostname = '172.29.213.225';
const port = process.env.PORT || 3000;

const app = express();

app.use(logErrors);
app.use(errorHandler);

// dev
app.set('etag', false)
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

app.set('view engine', 'ejs'); // app.set('views','views');
app.set('layout', './layout');
app.use( '/static', express.static('public', {index: false}) );
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET || 'dsadasdsadsada'));
app.use(utils.strictRender);
app.use(flashAll);

app.use('/', indexRouter);
app.use('/users', utils.auth, usersRouter);

// 404
app.use((req, res, next) => {
  res.status(404);
  utils.renderWithLayout(res, 'not_found', '404');
});

// 500
app.use((err, req, res, next) => {
  let a = next();
  if (err.message.includes('jwt')) {
    return void res
      .clearCookie('auth-cookie')
      .sendStatus(401)
      // .status(401)
      // .send({ message: 'Unauthenticated' });
  }
  if (err.message === 'not found') {
    return void res.status(404).send({ message: 'Not found' });
  }
  console.error('Final error', err.stack);
  return void res.status(500).send({ message: 'Server error!' });

  // res.status(500)
  // utils.renderWithLayout(res, 'error', 'Error', { error: err })
});


app.listen(port, hostname, () => {
  console.log(`Server is listening on http://${hostname}:${port}`);
});