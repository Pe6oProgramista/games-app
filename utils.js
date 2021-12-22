const { flashMessagesTypes } = require('./flashMessages');
const jwt = require('./jwt');
const layout = 'layout';

/** @module Utils */
module.exports = {
  /**
   * Render views with flash messages from cookies and set strict using locals in .ejs
   * @function strictRender
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @returns {void}
   */
  strictRender(req, res, next) {
    const oldRender = res.render;
    res.render = function(view, options, callback) {
      // rendered options to be accessible in the views only through the 'locals' object
      if(options) options._with = false;

      const flashMessages = Object.keys(req.cookies).reduce((acc, key) => {
        if(flashMessagesTypes.includes(key)) {
          acc[key] = req.cookies[key];
          res.clearCookie(key);
        }

        return acc;
      }, {});

      return oldRender.call(res, view, {...options, flashMessages}, callback);
    }

    next();
  },

  /**
   * @function renderWithLayout
   * @param {import('express').Response} res
   * @param {string} page name of the page .ejs file
   * @param {string} pageTitle title of the page 
   * @param {object} data object with different data depending on page to be rendered
   * @returns {void}
   */
  renderWithLayout(res, page, pageTitle, data) {
    return res.render(layout, { page, pageTitle, data });
  },

  // token struct: {id, username, created_at}

  // if user isAuth continue (for pages that user has to be auth) like signout
  /**
   * @function isAuth
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @returns {void}
   */
   auth(req, res, next) {
    const token = req.cookies['auth-cookie'];
    jwt.verify(token)
      .then((user) => next())
      .catch(err => {
        return void res.status(401).redirect('/signin');
      });
  },

  /**
   * @function apiAuth
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @returns {void}
   */
   apiAuth(req, res, next) {
    const token = req.cookies['auth-cookie'];
    jwt.verify(token)
      .then((user) => next())
      .catch(err => {
        return void res.status(401).send({redirectURL: new URL('/signin', `http://${req.headers.host}`)});
      });
  },

  // if user is notAuth continue (for pages that user has not to be auth) like signin
  /**
   * @function notAuth
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @returns {void}
   */
  notAuth(req, res, next) {
    const token = req.cookies['auth-cookie'];
    return void jwt.verify(token)
      .then((user) => {
        return void res.redirect('/');
      })
      .catch(err => {
        res.clearCookie('auth-cookie'); // token could be expired, but still there
        return void next();
      });
  },

  /**
   * @function apiNotAuth
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @returns {void}
   */
   apiNotAuth(req, res, next) {
    const token = req.cookies['auth-cookie'];
    return void jwt.verify(token)
      .then((user) => {
        return void res.status(302).send({redirectURL: new URL('/', `http://${req.headers.host}`)});
      })
      .catch(err => {
        res.clearCookie('auth-cookie'); // token could be expired, but still there
        return void next();
      });
  },

  isJSON(req, res, next) {
    if (!req.accepts('json')) {
      
    }

    return next();
  }
};