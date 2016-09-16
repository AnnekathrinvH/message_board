var express = require('express');
var app = express();

app.use(require('body-parser').urlencoded({
    extended: false
}));

var pg = require('pg');

app.use(express.static(__dirname));


app.post('/register', function(req, res) {
    console.log('registerroute on server');
    var first = req.body.first_name;
    var last = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password;


    var query = 'INSERT INTO register (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id';

    var client = new pg.Client('postgres://postgres:cooldatabase@localhost:5432/users');
    client.connect();
    client.query(query, [first, last, email, password], function(err, results) {
        if(err) {
            return res.sendStatus(400);
        }
        var currentUser = results.rows;
        console.log(currentUser);
        client.end();
        res.sendStatus(200);
    });
});

app.listen(8080);
