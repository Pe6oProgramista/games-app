import * as jwt from 'jsonwebtoken';
import env from './envConfig';
const secret = 'dsadsadassdsadsa';

export function createToken (payload: string | object | Buffer): Promise<string | undefined> {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, env.JWT_SECRET || secret, { expiresIn: (env.AUTH_TIME_IN_DAYS || 6) + 'd' }, (err, token) => {
      if (err) { return void reject(err); }
      resolve(token);
    })
  });
};

export function verify (token: string): Promise<string | jwt.JwtPayload | undefined> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, env.JWT_SECRET || secret, (err, decoded) => {
      if (err) { return void reject(err); }
      resolve(decoded);
    });
  });
};