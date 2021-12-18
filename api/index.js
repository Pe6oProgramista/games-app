const {Router} = require('express');
const indexRouter = require('./indexRouter');
const usersRouter = require('./usersRouter');

module.exports = {
    indexRouter,
    usersRouter
}
