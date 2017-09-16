var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('superagent');

//Create app instance
var app = express();
//Connect to MongoDB
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
//Load Models
var User = require('./models/user.js');

//Express Configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res){ 
    res.send('hi');
});

// Get user info from CapitalOne
app.get('/confirmuser/:id', function(req, res) {
    request.get('http://api.reimaginebanking.com/customers/' + req.params.id + '?key=' + process.env.API_KEY).end(function(response){
        if(err){
            res.setHeader('Content-Type', 'text/html');
            res.status(500).send({error: 'Can\'t find user info'});
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.json({firstname: response.body.first_name, lastname: response.body.last_name, address: response.body.address});
        }
    })
});

//API for creating posts through HTTP POST
app.post('/newuser', function (req, res) {

var newUser = new User();
newUser.username = req.body.username;
newUser.password = req.body.password;
newUser.email = req.body.email;
newUser.bankID = req.body.bankID;
newUser.firstname = req.body.firstname;
newUser.lastname = req.body.lastname;
newUser.isVendor = req.body.isVendor;

// save the user
User.findOne({ 'username': username },
function (err, user) {
    // In case of any error
    if (err)
        res.status(500).send({ error: 'Error while confirming username availability.' });
    // Username does not exist, log error & redirect back
    if (!user) {
        newUser.save(function (err) {
            if (err) {
                console.log('Error in Saving user: ' + err);
                res.status(500).send({ error: 'Error while creating user.' });
            }
            if (!err) {
                res.status(200).send('OK');
            }
        });
    } else if (user) {
        res.status(500).send({ error: 'User already exists.' });
    } else {
        res.status(500).send({ error: 'Something blew up.' });
    }
}
);
});

//API for READing Event data

/*
===========AUXILIARY FUNCTIONS============
*/

//Middleware for detecting if a user is verified
function isRegistered(req, res, next) {
if (req.isAuthenticated()) {
    console.log('cool you are a member, carry on your way');
    next();
} else {
    console.log('You are not a member');
    res.redirect('/signup');
}
}

//Middleware for detecting if a user is an admin
function isAdmin(req, res, next) {
if (req.isAuthenticated() && req.user.admin) {
    console.log('cool you are an admin, carry on your way');
    next();
} else {
    console.log('You are not an admin');
    res.send('You are not an administrator.', 403);
}
}

//===============PORT=================
var port = process.env.PORT || 3000; //select your port or let it pull from your .env file
app.listen(port);
console.log("listening on " + port + "!");