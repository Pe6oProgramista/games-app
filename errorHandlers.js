const utils = require("./utils")

module.exports = {
    logErrors (err, req, res, next) {
        console.error(err.stack);
        next(err);
    },

    // finalHandler (err, req, res, next) {
    //     res.status(500);
    //     utils.renderWithLayout(res, 'error', 'Error Page', { error: err });
    // },

    errorHandler (err, req, res, next) {
        if (res.headersSent) {
            return next(err);
        }
        res.status(500);
        utils.renderWithLayout(res, 'error', 'Error Page', { error: err });
    }
}