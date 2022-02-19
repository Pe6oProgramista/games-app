import { Router, NextFunction, Request, Response, RequestHandler } from 'express';
import * as bcrypt from 'bcrypt';
import env from '../../envConfig';
import * as utils from '../../utils';
import * as jwt from '../../jwt';
import { models } from '../../database/models';

const authRouter = Router();

export default authRouter;


authRouter.post('/signin', utils.apiNotAuth, (req, res, next) => {
    console.log('POST Sign In request body: ', req.body);
    
    let { identifier, password } = req.body;
    
    if (!identifier || !password) {
        // res.flashError('Please enter all fields');
        res.sendStatus(400);
    }
    
	models.User.authenticate(identifier, password)
    .then(result => {
		if(typeof result === 'number') {
            // if(result == 401) {
                // res.flashError('Wrong username/email or password');
            // }
            return res.sendStatus(result);
        }

        const currDate = new Date();
        res.cookie('auth-cookie', result, {
            expires: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + (env.AUTH_TIME_IN_DAYS || 6)),
            httpOnly: true
        });
        return void res.status(302).send({redirectURL: new URL('/', `http://${req.headers.host}`)});
	})
    .catch(next);
    
    // res.cookie('access_token', 'Bearer ' + token, { expires: new Date(Date.now() + 900000) /* maxAge: 900000*/, httpOnly: true }) // signed: true not nessesary when use jwt
});

authRouter.post('/signout', utils.apiAuth, (req, res) => {
	res.clearCookie('auth-cookie');
	return void res.send({redirectURL: new URL('/', `http://${req.headers.host}`)});
});

authRouter.post('/signup', utils.apiNotAuth, (req, res, next) => {
	console.log('POST Sign Up request body: ', req.body)

  	const { username, email, password, conf_password } = req.body;
	let hasErrors = false;

    if (!username || !email || !password || !conf_password) {
    //   res.flashError('Please enter all fields');
      return res.sendStatus(400);
    }

    models.User.exists(username)
    .then(exists => {
        if(exists) {
            // res.flashError('Account with tihs username already exists');
            return res.sendStatus(401);
        }
        
        if(hasErrors ||= password.length < 6) {
            // res.flashError('Password must be at least 6 characters');
        }
        
        if(hasErrors ||= !/\d/.test(password)) {
            // res.flashError('Password must have at least one digit');
        }
        
        if(hasErrors ||= password != conf_password) {
            // res.flashError('Passwords didn\'t match. Try again')
        }
        
        if(hasErrors) {
            return res.sendStatus(401);
        }
        
        // hashing and salt
        // https://auth0.com/blog/adding-salt-to-hashing-a-better-way-to-store-passwords/
        // https://security.stackexchange.com/questions/211/how-to-securely-hash-passwords
        bcrypt.hash(password, env.SALT_ROUNDS || 10).then(hash => {
            models.User.insert({username, email, password: hash}).then(results => {
                console.log('Insert into DB results: ', results);
                return void res.status(302).send({redirectURL: new URL('/signin', `http://${req.headers.host}`)});
            })
        });
    })
    .catch(next);
});