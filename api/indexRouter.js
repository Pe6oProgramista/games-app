const {Router} = require('express');
const bcrypt = require('bcrypt');
const utils = require('../utils');
const db = require('../db');
const jwt = require('../jwt');

/**
 * @type {Router}
 */
const indexRouter = new Router();

indexRouter.get('/', (req, res) => {
    utils.renderWithLayout(res, 'home', 'Games app');
});

indexRouter.get('/signin', utils.notAuth, (req, res) => {
	res.cookie('br', {a:'zdr'});
	console.log(req.cookies)

    res.type('html');
    // res.header("Content-Type",'text/html');
    utils.renderWithLayout(res, 'signin', 'Games app');
});

indexRouter.post('/signin', utils.notAuth, (req, res) => {
	console.log(req.headers)
	console.log('POST Sign In request body: ', req.body);

	res.send('HI');
	res.end();
	return;


    let { identifier, password } = req.body;

    if (!identifier || !password) {
      res.flashError('Please enter all fields');
      return res.sendStatus(400);
    }

	db.authUser(identifier).then(results => {
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
					return void res.redirect('/')// res.status(302).send({redirectURL: new URL('/', `http://${req.headers.host}`)});
				});
		});
	});
    
    // res.cookie('access_token', 'Bearer ' + token, { expires: new Date(Date.now() + 900000) /* maxAge: 900000*/, httpOnly: true }) // signed: true not nessesary when use jwt
	
    // return res.redirect('/');
    // return void res.status(302).send({redirectURL: new URL('/', `http://${req.headers.host}`)});
});

indexRouter.post('/signout', utils.isAuth, (req, res) => {
	res.clearCookie('auth-cookie');

	return void res.status(302).send({redirectURL: new URL('/', `http://${req.headers.host}`)});
});

indexRouter.get('/signup', utils.notAuth, (req, res) => {
    utils.renderWithLayout(res, 'signup', 'Games app');
});

indexRouter.post('/signup', utils.notAuth, (req, res) => {
	console.log('POST Sign Up request body: ', req.body)

  	const { username, email, password, conf_password } = req.body;
	let hasErrors = false;

    if (!username || !email || !password || !conf_password) {
      res.flashError('Please enter all fields');
      return res.sendStatus(400);
    }

		db.checkUser(username).then(results => {
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
		});
});

indexRouter.get('/about', (req, res) => {
    utils.renderWithLayout(res, 'about', 'Games app');
});

module.exports = indexRouter;