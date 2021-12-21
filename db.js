const { Pool, Connection } = require('pg');

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

pool.query('SELECT $1::text as message', ['Pool created!'], (err, res) => {
    console.log(err ? err.stack : res.rows[0].message);
})

//transaction: https://stackoverflow.com/questions/66138268/express-postgres-user-registration-controller

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
        console.error('Error running insert query', err.stack);
        throw err;
    });
}

function checkUser(username) {
    const query = {
        text: 'select id, username, email from app.users where username = $1',
		values: [username]
	}
    return pool.query(query)
    .catch(err => {
        console.error('Error running user check query', err.stack);
        throw err;
    });
}

function authUser(identifier) {
    const query = {
        text: 'select id, username, created_at, password from app.users where (username = $1 or email = $1)',
        values: [identifier]
    }
    
    return pool.query(query)
    .catch(err => {
        console.error('Error running authentication query', err.stack);
        throw err;
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