const utils = require("./utils")

module.exports = {
    apiNotFoundHandler(req, res, next) {
        console.error('Not found handler(API): Sending error to caller.');
        res.status(404).send({error: new Error('Not found')});
    },
    
    notFoundHandler(req, res, next) {
    	console.error('Not found handler: Sending error to caller.');
      res.status(404);
      utils.renderWithLayout(res, 'not_found', '404');
    },

    logErrors (err, req, res, next) {
        console.error('Error logger: ', err.stack);
        next(err);
    },

    apiFinalHandler (err, req, res, next) {
        console.error('Final error handler(API): ');
        if (res.headersSent) {
            console.error('Response headers are sent.');
            return next(err);
        }
        console.error('Sending error to caller.');
        res.status(500).send({error: err});
    },

    finalHandler (err, req, res, next) {
        console.error('Final error handler: ');
        if (res.headersSent) {
            console.error('Response headers are sent.');
            return next(err);
        }
        console.error('Sending error to caller.');
        res.status(500);
        utils.renderWithLayout(res, 'error', 'Error Page', { error: err });
    }
}