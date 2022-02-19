import { Request, Response, NextFunction } from 'express';
import { models } from './database/models';
import { flashMessagesTypes } from './flashMessages';
import * as jwt from './jwt';
const layout = 'layout';

// // Render views with flash messages from cookies and set strict using locals in .ejs
// export function strictRender(req: Request, res: Response, next: NextFunction) {
//     const oldRender = res.render;
//     res.render = function(view: string, options?: object | undefined, callback?: ((err: Error, html: string) => void) | undefined): void {
//       // rendered options to be accessible in the views only through the 'locals' object
//       if(options) options = { ...options, _with = false };

//       const flashMessages = Object.keys(req.cookies).reduce((acc, key) => {
//         if(flashMessagesTypes.includes(key)) {
//           acc[key] = req.cookies[key];
//           res.clearCookie(key);
//         }

//         return acc;
//       }, {[key: string]: });

//       return oldRender.call(res, view, {...options, flashMessages}, callback);
//     }

//     next();
//   }

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type PartlyRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export function renderWithLayout(res: Response, page: string, pageTitle: string, data?: object) {
  return res.render(layout, { page, pageTitle, data });
}

export function setAuthLocal(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['auth-cookie'];
  jwt.verify(token)
    .then((user) => {
      const uid = (<any>user).id;
      return models.User.existsId(uid).then(exists => {
        if(exists) res.locals.auth = true;
        else {
          res.clearCookie('auth-cookie');
          res.locals.auth = false}  
        })
      .catch(err => {
        res.clearCookie('auth-cookie');
        res.locals.auth = false})
    })
    .catch(err => {
      res.clearCookie('auth-cookie');
      res.locals.auth = false})
    .finally(() => next());
}

// if user isAuth continue (for pages that user has to be auth) like signout
export function auth(req: Request, res: Response, next: NextFunction) {
  // token struct: {id, username, created_at}
  const token = req.cookies['auth-cookie'];
  jwt.verify(token)
    .then((user) => {
      res.locals.auth = true;
      return void next();
    })
    .catch(err => {
      return void res.status(401).redirect('/signin');
    });
}

export function apiAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['auth-cookie'];
  jwt.verify(token)
    .then((user) => next())
    .catch(err => {
      return void res.status(401).send({redirectURL: new URL('/signin', `http://${req.headers.host}`)});
    });
}

// if user is notAuth continue (for pages that user has not to be auth) like signin
export function notAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['auth-cookie'];
  return void jwt.verify(token)
    .then((user) => {
      return void res.redirect('/');
    })
    .catch(err => {
      res.clearCookie('auth-cookie'); // token could be expired, but still there
      res.locals.auth = false;
      return void next();
    });
}

export function apiNotAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['auth-cookie'];
  return void jwt.verify(token)
    .then((user) => {
      return void res.status(302).send({redirectURL: new URL('/', `http://${req.headers.host}`)});
    })
    .catch(err => {
      res.clearCookie('auth-cookie'); // token could be expired, but still there
      return void next();
    });
}

export function isJSON(req: Request, res: Response, next: NextFunction) {
  if (!req.accepts('json')) {
    
  }

  return next();
}

export function asDict(obj: object): {[key: string]: any} {
  return Object.entries(obj).reduce((acc, [k, v]) => {
      acc[k] = v; return acc
    },
  {} as { [x: string]: any })
}