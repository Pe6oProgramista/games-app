const {Router} = require('express');
const bcrypt = require('bcrypt');
const utils = require('../utils');
const db = require('../db');

/**
 * @type {Router}
 */
const indexRouter = new Router();

indexRouter.get('/', (req, res) => {
    utils.renderWithLayout(res, 'home', 'Games app');
});

indexRouter.get('/signin', (req, res) => {
    res.type('html');
    // res.header("Content-Type",'text/html');
    utils.renderWithLayout(res, 'signin', 'Games app');
});

indexRouter.post('/signin', utils.isAuth, (req, res) => {
    let { identifier, password } = req.body;

    console.log({identifier, password});

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

					return void res.status(302).send({redirectURL: new URL('/', `http://${req.headers.host}`)});
			});
		});


	// interface opredelq nqkakva struktura na nashite obekti i nqma da bude dobaveno v js
	// /environment - custom webpack loader

    // bcrypt.compare(myPlaintextPassword, hash).then(function(result) {
    //     // result == true
    // });


    // return res.redirect('/');
    // console.log(req.get('Content-Type'));
    // console.log(req.body);
    
    // res.cookie('access_token', 'Bearer ' + token, { expires: new Date(Date.now() + 900000) /* maxAge: 900000*/, httpOnly: true }) // signed: true not nessesary when use jwt

    // return void res.status(302).send({redirectURL: new URL('/', `http://${req.headers.host}`)});
});

indexRouter.post('/signout', (req, res) => {
    res.redirect('/');
});

indexRouter.get('/signup', (req, res) => {
    utils.renderWithLayout(res, 'signup', 'Games app');
});

indexRouter.post('/signup', (req, res) => {
  let { username, email, password, conf_password } = req.body;

    console.log({username, email, password, conf_password});

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
					console.log(results);
					return void res.status(302).send({redirectURL: new URL('/signin', `http://${req.headers.host}`)});
				})
    	});
		});
});

indexRouter.get('/about', (req, res) => {
    utils.renderWithLayout(res, 'about', 'Games app');
});

module.exports = indexRouter;