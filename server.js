var express = require('express');
var app = express();
let {Pool, Client } = require('pg');
var bodyParser = require('body-parser');
let cors = require('cors');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())


const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	database: 'vk_app',
	password: 'postgres',
	port: 5432,
	// ssl: true
});

let setResponseHeaders = (response) => {
	//https://alexzhaba.github.io
	//194.58.107.149:3000
	//http://localhost:10888
	response.setHeader("Access-Control-Allow-Origin", "https://alexzhaba.github.io");
	// response.setHeader("Access-Control-Allow-Origin", "http://localhost:10888");
	// response.setHeader("Access-Control-Allow-Origin", "194.58.107.149:3000");

}
app.get('/getUserById/:id', (req, res) => {
	setResponseHeaders(res);
	console.log(req.params.id);
	pool.connect((err, client, done) => {
		if (err) throw err;
		client.query(`SELECT * FROM USERS WHERE id=${req.params.id}`, (err, result) => {
			if (err) throw (err);
			done();
			let respObj;
			// if (result.rows.length == 0) respObj.error
			res.json(result.rows);
		})
	});
//   res.send('Hello World!');
});
app.post('/addQuestToUser', (req, res) => {
	setResponseHeaders(res);
	let quest = req.body;
	console.log('quest = ',quest)
	pool.connect((err, client, done) => {
		if (err) throw err;
		client.query(`INSERT INTO QUESTS VALUES(${quest.user_id}, '${quest.text}', '${quest.description}', false, 0, ${Date.now() + 1000 * 60 * 60 * 24}, 0, ${quest.manaBonus}, ${quest.expBonus}, ${quest.manaDowner}, ${quest.expDowner})`, (err, result) => {
			if (err) throw err;
			done();
			res.json({msg: 'added Quest'});
		})
	});
	
});
app.post('/setUser', (req, res) => {
	setResponseHeaders(res);
	pool.connect((err, client, done) => {
		if (err) throw err;
		client.query(`UPDATE USERS SET unusedquests=${req.body.newUnusedQuests} WHERE ID=${req.body.user_id}`, (err, result) => {
			if (err) throw err;
			done();
			res.json({msg: "update"})
		})
	})
});
app.get('/getQuestsById/:id', (req, res) => {
	setResponseHeaders(res);
	pool.connect((err, client, done) => {
		if (err) throw err;
		client.query(`SELECT * FROM QUESTS WHERE ID=${req.params.id} ORDER BY COMPLETED`, (err, result) => {
			if (err) throw err;
			done();
			res.json({quests: result.rows});
		})
	})
})
app.post('/createNewUser', (req, res) => {
	setResponseHeaders(res);
	let user = req.body;
	console.log('POST - /createNewUser');
	console.log(user);
	pool.connect((err, client, done) => {
		if (err) throw err;
		client.query(`INSERT INTO USERS VALUES(${user.id}, '${user.first_name}', '${user.last_name}', '${user.photo_100}', 100, 1, 50, 0, 10)`, (err, result) => {
			if (err) throw err;
			console.log('User was created with id ', user.id)
			if (err) throw err;
			client.query(`SELECT * FROM USERS WHERE ID=${user.id}`, (err, result) => {
				if (err) throw err;
				done();
				res.json(result.rows[0]);
			})
		});
	})
});

app.post('/setQuest', (req, res) => {
	setResponseHeaders(res);
	console.log(req.body)
	let user = req.body.user;
	pool.connect((err, client, done) => {
		if (err) throw err;
		client.query(`UPDATE QUESTS SET completed=${req.body.completed} WHERE TEXT='${req.body.text}'`, (err, result) => {
			if (err) throw err;
			client.query(`UPDATE USERS SET mana=${Math.min(100, user.mana + req.body.manaBonus)}, currentlvl=${(user.currentlvl + req.body.expBonus) % user.maxlvlpoints}, `
			+ `level=${user.currentlvl + req.body.expBonus >= user.maxlvlpoints ? user.level + 1 : user.level}, unusedquests=${user.currentlvl + req.body.expBonus >= user.maxlvlpoints ? user.unusedquests + 2 : user.unusedquests} WHERE ID=${user.id}`, (err, result) => {
				if (err) throw err;
				console.log('result = ', result)
				done();
				let newLvl = user.currentlvl + req.body.expBonus >= user.maxlvlpoints ? user.level + 1 : 0;
				
				res.json({msg: 'UPDATE', newLvl: newLvl, unusedquests: newLvl ? user.unusedquests + 2 : user.unusedquests})
			});
		})
	})
});
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
