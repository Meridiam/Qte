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

// Confirm user registration info from CapitalOne
app.get('/confirmuser/:id', function(req, res) {
    request.get('http://api.reimaginebanking.com/customers/' + req.params.id + '?key=' + process.env.API_KEY).end(function(err,response){
        if(err){
            res.setHeader('Content-Type', 'text/html');
            res.status(500).send({error: 'Can\'t find user info'});
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.json({firstname: response.body.first_name, lastname: response.body.last_name, address: response.body.address});
        }
    })
});

// Get user info from CapitalOne for client-side rendering
/*
app.post('/data/:email', function(req, res) {
    User.findOne({ 'email': req.param.email }, function (err, user) {
        if (err) {
            res.status(500).send({ error: 'User does not exist.' });
        } else {
            request.get('http://api.reimaginebanking.com/customers/' + req.params.id + '?key=' + process.env.API_KEY)
                .end( function( err,response ) {
                if (err) {
                    res.status(500).send({ error: 'Can\'t find user info' });
                } else {
                    res.json({firstname:user.firstname, lastname: user.lastname, balance: response.body.balance, account_number: response.body.account_number});
                }
            });
        }
    });
});
*/

//API for creating users through HTTP POST
app.post('/newuser', function (req, res) {

var newUser = new User();
newUser.email = req.body.email;
newUser.password = req.body.password;
newUser.bankID = req.body.bankID;

// save the user
User.findOne({ 'email': req.body.email },
function (err, user) {
    // In case of any error
    if (err)
        res.status(500).send({ error: 'Error while confirming unique account.' });
    // Email does not exist, log error & redirect back
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

// Delete user
app.delete('/deluser', function(req, res) {
    User.findOneAndRemove({email: req.body.email}, function(err, response) {
        if(err || !response) {
            res.setHeader('Content-Type', 'text/html');
            res.status(500).send('Can\'t find user: ' + req.body.email);
        } else {
            res.status(200).send('User ' + req.body.email + ' deleted.');
        }
    });
});

// Update password
app.post('/changepass/', function(req, res) {
    User.findOneAndUpdate({email: req.body.email}, {password: req.body.password}, function(err, response) {
        if(err || !response) {
            res.setHeader('Content-Type', 'text/html');
            res.status(500).send('Can\'t find user: ' + req.body.email);
        } else {
            res.status(200).send('Password changed.');
        }
    })
});

// Change bankID
app.post('/changeid/', function(req, res) {
    User.findOneAndUpdate({email: req.body.email}, {bankID: req.body.bankID}, function(err, response) {
        if(err || !response) {
            res.setHeader('Content-Type', 'text/html');
            res.status(500).send('Can\'t find user: ' + req.body.email);
        } else {
            res.status(200).send('Bank ID changed.');
        }
    })
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