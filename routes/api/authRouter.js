const { Router } = require('express');
const bcrypt = require('bcrypt');
const utils = require('../../utils');
const jwt = require('../../jwt');
const db = require('../../db');

const authRouter = new Router();



module.exports = authRouter;



authRouter.post('/signin', utils.apiNotAuth, (req, res, next) => {
    console.log('POST Sign In request body: ', req.body);
    
    let { identifier, password } = req.body;
    
    if (!identifier || !password) {
        res.flashError('Please enter all fields');
        return res.sendStatus(400);
    }
    
	db.authUser(identifier)
    .then(results => {
		if(results.rowCount === 0) {
			res.flashError('Wrong username/email or password');
			return res.sendStatus(401);
		}
		
		if(!results.rows[0].password) return res.sendStatus(500);
		bcrypt.compare(password, results.rows[0].password).then(function(same) {
				if(!same) {
					res.flashError('Wrong username/email or password');
					return res.sendStatus(401);
				}
				
				const {password, ...payload} = results.rows[0];
				jwt.createToken(payload).then(token => {
					const currDate = new Date();
					res.cookie('auth-cookie', token, {
						expires: new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + (process.env.AUTH_TIME_IN_DAYS || 6)),
						httpOnly: true
					});
					return void res.status(302).send({redirectURL: new URL('/', `http://${req.headers.host}`)});
				});
		});
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
      res.flashError('Please enter all fields');
      return res.sendStatus(400);
    }

    db.checkUser(username)
    .then(results => {
        if(results.rowCount > 0) {
            res.flashError('Account with tihs username already exists');
            return res.sendStatus(401);
        }
        
        if(hasErrors ||= password.length < 6) {
            res.flashError('Password must be at least 6 characters');
        }
        
        if(hasErrors ||= !/\d/.test(password)) {
            res.flashError('Password must have at least one digit');
        }
        
        if(hasErrors ||= password != conf_password) {
            res.flashError('Passwords didn\'t match. Try again')
        }
        
        if(hasErrors) {
            return res.sendStatus(401);
        }
        
        bcrypt.hash(password, process.env.SALT_ROUNDS || 10).then(hash => {
            db.insertUser(username, email, hash).then(results => {
                console.log('Insert into DB results: ', results);
                return void res.status(302).send({redirectURL: new URL('/signin', `http://${req.headers.host}`)});
            })
        });
    })
    .catch(next);
});