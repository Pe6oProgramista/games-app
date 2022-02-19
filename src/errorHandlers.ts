import { ErrorRequestHandler, RequestHandler } from 'express';
import * as utils from './utils'

export {
    apiNotFoundHandler,
    notFoundHandler,
    logErrors,
    apiFinalHandler,
    finalHandler,
}

const apiNotFoundHandler: RequestHandler = (req, res, next) => {
    console.error('Not found handler(API): Sending error to caller.');
    res.status(404).send({error: new Error('Not found')});
}
    
const notFoundHandler: RequestHandler = (req, res, next) => {
    console.error('Not found handler: Sending error to caller.');
    res.status(404);
    res.render('pages/not_found')
    // utils.renderWithLayout(res, 'not_found', '404');
}

const logErrors: ErrorRequestHandler = (err, req, res, next) => {
    console.error('Error logger: ', err.stack);
    next(err);
}

const apiFinalHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error('Final error handler(API): ');
    if (res.headersSent) {
        console.error('Response headers are sent.');
        return next(err);
    }
    console.error('Sending error to caller.');
    res.status(500).send({error: err});
}

const finalHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error('Final error handler: ');
    if (res.headersSent) {
        console.error('Response headers are sent.');
        return next(err);
    }
    console.error('Sending error to caller.');
    res.status(500);
    res.render('pages/error', { error: err })
    // utils.renderWithLayout(res, 'error', 'Error Page', { error: err });
}