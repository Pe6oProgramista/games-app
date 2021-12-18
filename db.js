const { Pool } = require('pg');

// process.envs:
//     DB_USER
//     DB_PASSWORD
//     DB_HOST
//     DB_PORT
//     DB_DATABASE

const db_config = {
    // user: 'games_app_admin',
    // password: '123',
    // host: '127.0.0.1',
    // port: 5432,
    // database: 'games_app',
    connectionString: process.env.DATABASE_URL || 'postgresql://games_app_admin:123@127.0.0.1:5432/games_app'
};

const pool = new Pool(db_config);
console.log('pool created');

/**
 * @function insertUser
 * @param {string} username max 30 chars
 * @param {string} email max 40 chars
 * @param {password} password max 60 chars
 * @returns {Promise}
 */
function insertUser(username, email, password) {
    const query = {
		text: 'insert into app.users (username, email, password) values ($1, $2, $3)',
		values: [username, email, password]
	}
    return pool.query(query)
        .catch(err => {
            console.error('error running insert query', err.stack);
        });
}

function checkUser(username) {
    const query = {
		text: 'select id, username, email from app.users where username = $1',
		values: [username]
	}
    return pool.query(query)
        .catch(err => {
            console.error('error running insert query', err.stack);
        });
}

function authUser(identifier) {
    const query = {
        text: 'select id, username, created_at, password from app.users where (username = $1 or email = $1)',
        values: [identifier]
    }

    return pool.query(query)
        .catch(err => {
            console.error('error running user check query', err.stack);
        });
}

function endPool() {
    pool.end()
        .then(() => console.log('pool has ended'));
}

module.exports = {
    insertUser,
    checkUser,
    authUser,
    endPool
}