const jwt = require('jsonwebtoken');
const secret = 'dsadsadassdsadsa';

module.exports.createToken = function (payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, process.env.JWT_SECRET || secret, { expiresIn: (process.env.AUTH_TIME_IN_DAYS || 6) + 'd' }, (err, token) => {
      if (err) { return void reject(err); }
      resolve(token);
    })
  });
};

module.exports.verify = function (token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET || secret, (err, decoded) => {
      if (err) { return void reject(err); }
      resolve(decoded);
    });
  });
};