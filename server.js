var express = require('express');
var app = express();
let {Pool, Client } = require('pg');

const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'vk_app',
	password: 'postgres',
	port: 5432,
	// ssl: true
});


app.get('/', function (req, res) {
	pool.connect((err, client, done) => {
		if (err) throw err;
		client.query(`SELECT * FROM USERS`, (err, result) => {
			if (err) throw;
			done();
			res.json(result.rows);
		})
	});
//   res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
