const {Router} = require('express');
const bcrypt = require('bcrypt');
const utils = require('../utils');
const db = require('../db');
const jwt = require('../jwt');
const { logErrors, finalHandler, notFoundHandler } = require('../errorHandlers');

/**
 * @type {Router}
 */
const indexRouter = new Router();



module.exports = indexRouter;



indexRouter.get('/', (req, res) => {
    utils.renderWithLayout(res, 'home', 'Games app');
});

indexRouter.get('/signin', utils.notAuth, (req, res) => {
    // res.type('html');
    // res.header("Content-Type",'text/html');
    utils.renderWithLayout(res, 'signin', 'Games app');
});

indexRouter.get('/signup', utils.notAuth, (req, res) => {
    utils.renderWithLayout(res, 'signup', 'Games app');
});

indexRouter.get('/about', (req, res) => {
    utils.renderWithLayout(res, 'about', 'Games app');
});

indexRouter.get('/games', (req, res) => {
    utils.renderWithLayout(res, 'games', 'Games app');
});

indexRouter.use(notFoundHandler);
indexRouter.use(logErrors);
indexRouter.use(finalHandler);