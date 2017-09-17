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
var Transaction = require('./models/transaction.js');

//Express Configuration
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Confirm user registration info from CapitalOne

app.get('/confirmuser/:bankID', function(req, res) {
    request.get('http://api.reimaginebanking.com/customers/' + req.params.bankID + '?key=' + process.env.API_KEY).end(function(err,response){
        if (err){
            res.status(500).send({error: 'Can\'t find user info'});
        } else {
            res.json({firstname: response.body.first_name, lastname: response.body.last_name});
        }
    })
});

// Check if given username/password combo is a registered user
app.get('/verify/:username/:password', function(req, res){
    User.findOne({ 'username': req.param.username }, function (err, user) {
        if (err || !user) {
            res.status(500).send({ error: 'User does not exist.' });
        } else if ( req.param.password == user.password ) {
            res.send({ isRegistered: true });
        } else {
            res.send({ isRegistered: false });
        }
    });
});

// Get user info from CapitalOne for client-side rendering
app.get('/data/:username', function(req, res) {
    User.findOne({ 'username': req.param.username }, function (err, user) {
        if (err) {
            res.status(500).send({ error: 'User does not exist.' });
        } else {
            request.get('http://api.reimaginebanking.com/customers/' + user.bankID + '?key=' + process.env.API_KEY)
                .end( function( err, response ) {
                if (err) {
                    res.status(500).send({ error: 'Can\'t find user info' });
                } else {
                    res.json({firstname: user.firstname, lastname: user.lastname, username: user.username, balance: response.body.balance, account_number: response.body.account_number, transactions: user.recentTransactions});
                }
            });
        }
    });
});


//API for creating users through HTTP POST
app.post('/newuser', function (req, res) {

    var newUser = new User();
//    newUser.email = req.body.email;
    newUser.username = req.body.username;
    newUser.password = req.body.password;
    newUser.bankID = req.body.bankID;

    // save the user
    User.findOne({ 'username': req.body.username },
    function (err, user) {
        // In case of any error
        if (err)
            res.status(500).send({ error: 'Error while confirming unique account.' });
        // Username does not exist, log error & redirect back
        if (!user) {
            newUser.save(function (err) {
                if (err) {
                    console.log('Error in Saving user: ' + err);
                    res.status(500).send({ error: 'Error while creating user.' });
                }
                if (!err) {
                    res.status(200).send('User registered.');
                }
            });
        } else if (user) {
            res.status(500).send({ error: 'User already exists.' });
        } else {
            res.status(500).send({ error: 'Something blew up.' });
        }
    });
});

// Delete user
app.delete('/deluser', function (req, res) {
    User.findOneAndRemove({ username: req.body.username }, function (err, response) {
        if(err || !response) {
            res.status(500).send('Can\'t find user: ' + req.body.username);
        } else {
            res.status(200).send('User ' + req.body.username + ' deleted.');
        }
    });
});

// Update password
app.post('/changepass', function (req, res) {
    User.findOneAndUpdate({ username: req.body.username }, { password: req.body.password }, function (err, response) {
        if(err || !response) {
            res.status(500).send('Can\'t find user: ' + req.body.username);
        } else {
            res.status(200).send('Password changed.');
        }
    })
});

// Change bankID
app.post('/changeid', function (req, res) {
    User.findOneAndUpdate({ username: req.body.username }, { bankID: req.body.bankID }, function (err, response) {
        if(err || !response) {
            res.status(500).send('Can\'t find user: ' + req.body.username);
        } else {
            res.status(200).send('Bank ID changed.');
        }
    })
});

//Change email
/*app.post('/changeemail', function (req, res) {
    User.findOneAndUpdate({ username: req.body.username }, { email: req.body.email }, function (err, response){
        if (err || !response) {
            res.status(500).send('Can\'t find user: ' + req.body.username);
        } else { 
            res.status(200).send('Email changed.');
        }
    });
});
*/

//Transaction Processing
app.post('/pay/:username/:amount', function (req, res) {
    User.findOne({ username: req.body.username }, function (err, payee) {
        if (err || !payee) {
            res.status(500).send('Can\'t find user: ' + req.body.username);
        } else {
            User.findOne({ username: req.params.username }, function (err, payer) {
                if (err || !payer){
                    res.status(500).send('Can\'t find user: ' + req.params.username);
                } else {
                    if (parseInt(req.params.amount) > getBalance(req.body.username)){
                        res.status(500).send('Insufficient Funds.');
                    } else {
                        var myDate = new Date();
                        var transactjson = {medium: "balance", transaction_date: myDate.toISOString().slice(0,9), amount: parseInt(req.params.amount), description: "Qte"};
                        request.post('http://api.reimaginebanking.com/accounts/' + payee.bankID + '/deposits?key=' + process.env.API_KEY)
                        .set("Content-Type", "application/json")
                        .send(transactjson)
                        .end(function(err,response) {
                            if(err) {
                                res.status(500).send({error: 'Failed to deposit.'});
                            }
                        });
                        request.post('http://api.reimaginebanking.com/accounts/' + payer.bankID + '/withdrawals?key=' + process.env.API_KEY)
                        .set("Content-Type", "application/json")
                        .send(transactjson)
                        .end(function(err,response) {
                            if(err) {
                                res.status(500).send({error: 'Failed to withdraw.'});
                            }
                        });
                        var newTrans = new Transaction();
                        newTrans.payer = payer;
                        newTrans.payee = payee;
                        newTrans.amount = req.params.amount;
                        payer.recentTransactions.push(newTrans);
                        payee.recentTransactions.push(newTrans);
                        newTrans.save(function (err){
                            if(err) {
                                res.status(500).send({error: 'Couldn\'t save transaction.'});
                            } else {
                                res.status(200).send('Transaction successful!');
                            }
                        });
                    }
                }
            });
        }
    });
});

/*
===========AUXILIARY FUNCTIONS============
*/

//Middleware for detecting if a user is verified

//Get a customer account
function getBalance(Username) {
    User.findOne({ 'username': Username }, function (err, user) {
        if (err || !user){
            res.status(500)
                .send('Can\'t find user: ' + Username);
        } else {
            request.get('http://api.reimaginebanking.com/accounts/' + user.bankID + '?key=' + process.env.API_KEY)
            .end( function( err,response ) {
            if (err || !response) {
                res.status(500).send({ error: 'Can\'t find user info' });
            } else {
                return response.body.balance;
            }
        });
        }
    });
}

//===============PORT=================
var port = process.env.PORT || 8081; //select your port or let it pull from your .env file
app.listen(port);
console.log("listening on " + port + "!");