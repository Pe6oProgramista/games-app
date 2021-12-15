const express = require('express');
// const jwt = require('./jwt');
// const cookieParser = require('cookie-parser');
// const bodyParser = require('body-parser');
// const utils = require('./utils');
const app = express();

const host = '172.22.244.168';
const port = process.env.PORT || 3000;

const db_config = {
  // user: 'games_app_admin',
  // password: '123',
	// host: '127.0.0.1',
  // port: 5432,
  // database: 'games_app',
	connectionString: process.env.DATABASE_URL || 'postgresql://games_app_admin:123@127.0.0.1:5432/games_app'
};


app.get("/", (req, res) => {
  res.send("Hello")
})

app.listen(port, host, () => {
  console.log(`Server is listening on http://${host}:${port}`);
});