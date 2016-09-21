var express = require('express');
var app = express();
var encryptPw = require('./password_module');

var user = {

};

app.use(require('body-parser').urlencoded({
    extended: false
}));

var pg = require('pg');

var redis = require('redis');
var client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.on('error', function(err) {
    console.log(err);
});

var session = require('express-session');
var Store = require('connect-redis')(session);

var hb = require('express-handlebars');
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');



app.use(session({
    store: new Store({
        ttl: 3600,
        host: 'localhost',
        port: 6379
    }),
    resave: false,
    saveUninitialized: true,
    secret: 'my super fun secret'
}));

app.use(express.static(__dirname));

var checkStatus = function(req, res, next) {
    if (req.session.user.loggedIn) {
        next();
    } else {
        return res.sendStatus(401);
    }
};


app.get('/', function(req, res) {
    console.log(req.session.user);
    if (req.session.user === undefined) {
        user = {
            first: '',
            last: '',
            email: '',
            loggedIn: false
        };
    }
    else if (req.session.user) {
        user = req.session.user;
    }
    res.render('index', {
        user: user,
        'raw-helper': function(options) {
            return options.fn();
        }
    });
});

app.post('/register', function(req, res) {
    console.log('registerroute on server');
    var first = req.body.first_name;
    var last = req.body.last_name;
    var email = req.body.email;
    var password = req.body.password;
    encryptPw.hashPassword(password, createUser);

    function createUser(err, hash) {

        var query = 'INSERT INTO register (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING id';

        var client = new pg.Client('postgres://postgres:cooldatabase@localhost:5432/users');
        client.connect();
        client.query(query, [first, last, email, hash], function(err, results) {
            if(err) {
                return res.sendStatus(400);
            }
            var dbId = results.rows[0].id;
            console.log(dbId);
            user.dbId = dbId;
            user.first = first;
            user.last = last;
            user.email = email;
            user.loggedIn = true;
            req.session.user = user;
            client.end();
            res.sendStatus(200);
        });
    }
});

app.post('/login', function(req, res) {
    console.log('loginroute on server');
    var first = req.body.first_name;
    var last = req.body.last_name;
    var email = req.body.email;
    var loginpassword = req.body.password;


    var query = 'SELECT password, id FROM register WHERE register.first_name = $1 AND register.last_name = $2 AND register.email = $3';

    var client = new pg.Client('postgres://postgres:cooldatabase@localhost:5432/users');
    client.connect();
    client.query(query, [first, last, email], function(err, results) {
        if(err) {
            console.log(err);
            return res.sendStatus(400);
        }
        var dbPassword = results.rows[0].password;
        console.log(dbPassword);
        client.end();
        encryptPw.checkPassword(loginpassword, dbPassword, response);
        function response(err, doesMatch){
            user.dbId = results.rows[0].id;
            user.first = first;
            user.last = last;
            user.email = email;
            req.session.user = user;
            user.loggedIn = true;


            res.sendStatus(200);
            console.log(doesMatch);
        }
    });

});

app.get('/messages', checkStatus, function(req, res) {

    var query = 'SELECT messages.message, messages.time, register.first_name FROM register JOIN messages ON register.id=messages.id';

    var client = new pg.Client('postgres://postgres:cooldatabase@localhost:5432/users');
    client.connect();
    client.query(query, function(err, results) {
        if (err) {
            console.log(err);
            returnres.sendStatus(400);
        } else {
            console.log(results.rows);
            res.json({
                messages: results.rows
            });
        }
    });
});

app.post('/messages', function(req, res) {
    console.log('messagesroute on server');
    var message = req.body.message;
    var now = Date.now();
    var userId = req.session.user.dbId;

    var query = 'INSERT INTO messages (id, time, message) VALUES ($1, $2, $3)';

    var client = new pg.Client('postgres://postgres:cooldatabase@localhost:5432/users');
    client.connect();
    client.query(query, [userId, now, message], function(err, results) {
        if(err) {
            console.log(err);
            return res.sendStatus(400);
        }
        var id = results.rows;
        client.end();
        res.sendStatus(200);
    });
});

app.listen(8080);
