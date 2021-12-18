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
      options._with = false;

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

  /**
   * @function auth
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   * @param {import('express').NextFunction} next
   * @returns {void}
   */
  auth(req, res, next) {
    const token = req.cookies['auth-cookie'];
    jwt.verify(token)
      .then(({ user }) => {
        req.user = user;
        next();
      })
      .catch(next);
  },

  isAuth(req, res, next) {
    
    return next();
  },

  notAuth(req, res, next) {
    
    return next();
  },

  isJSON(req, res, next) {
    if (!req.accepts('json')) {
      
    }

    return next();
  }
};