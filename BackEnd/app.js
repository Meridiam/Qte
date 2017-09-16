var express = require('express'),
    bodyParser = require('body-parser'),
    request = require('superagent');

//987d4c350d2523a6305b2d44c1108509

//Create app instance
var app = express();
//Connect to MongoDB
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);

//displays homepage
app.get('/', function (req, res) {
Post.find({}).sort('-created_at').populate('author').exec(function (err, posts) {
    Event.find({
        happens: {
            $gte: new Date()
        }
    })
        .sort('happens')
        .exec(function (err, events) {
            res.render('home', {
                user: req.user,
                news: posts,
                events: events,
                message: req.flash('message'),
                resetPass: req.flash('resetPass')
            });
        });
});
});

//sends the request through local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page

//sends the request through local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page

//logs user out of site, deleting them from the session, and returns to homepage

//User/Admin Management Panel

//Render reset password screen

//API for deleting users

// Get user info from CapitalOne
app.get('/confirmuser/:id', function(req, res) {
    request.get('http://api.reimaginebanking.com/customers/' + req.params.id + '?key=' + process.env.API_KEY).end(function(response){
        if(err){
            res.setHeader('Content-Type', 'text/html');
            res.status(500).send({error: 'Can\'t find user info'});
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.json({firstname: res.body.first_name, lastname: res.body.last_name, address: res.body.address});
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
    // In case of any error, return using the done method
    if (err)
        return done(err);
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
    }
    return done(null, user);
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