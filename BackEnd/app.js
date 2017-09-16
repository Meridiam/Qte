var express = require('express'),

//Create app instance
var app = express();
//Connect to MongoDB
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI);
//Load Models

/*
=============AUXILIARY FUNCTIONS==============
*/


/*
================USER AUTHENTICATION================
*/

//==============AUXILIARY FUNCTION===============

//===============================================

//==============AUXILIARY FUNCTION===============

//===============================================

//===============EXPRESS================
// Configure Express

// Session-persisted message middleware

// Configure express to use handlebars templates

//===============ROUTES=================
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

//displays signup page
app.get('/signup', function (req, res) {
res.render('signup', { message: req.flash('message') });
});

//sends the request through local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/local-reg', passport.authenticate('local-signup', {
successRedirect: '/',
failureRedirect: '/signup'
})
);

//sends the request through local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
app.post('/login', passport.authenticate('local-signin', {
successRedirect: '/',
failureRedirect: '/'
})
);

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', isRegistered, function (req, res) {
var name = req.user.username;
console.log("LOGGING OUT " + req.user.username);
req.logout();
res.redirect('/');
req.session.notice = "You have successfully been logged out " + name + "!";
});

/*
===========Management Routes============
*/

//User/Admin Management Panel
app.get('/members', isRegistered, function (req, res) {
User.find()
    .sort({ lowerLast: 1 })
    .exec(function (err, users) {
        Event.find()
            .sort('-happens')
            .exec(function (err, events) {
                User.findOne({ '_id': req.user._id })
                    .populate('events')
                    .exec(function (err, user) {
                        res.render('members', {
                            user: req.user,
                            members: users,
                            events: events,
                            personals: user.events
                        });
                    });
                console.log(JSON.stringify(users, null, "\t"));
            });
    });
});

//Render reset password screen
app.get('/resetpass/:id', isRegistered, function (req, res) {
res.render('resetpwd', {
    'user': req.params.id
})
});

/*
=============CRUD ROUTES=============
*/

//API for deleting users
app.get('/deluser/:id', isAdmin, function (req, res) {
User.find({ '_id': req.params.id })
    .remove()
    .exec(function (err) {
        if (err) {
            return done(err);
        }
        res.redirect('/members');
    });
});

//API for creating posts through HTTP POST
app.post('/newpost', isAdmin, function (req, res) {
var title = req.body.title,
    html = md.render(req.body.info);

var currentDate = new Date();
var newPost = new Post();
newPost.title = title;
newPost.body = html;
newPost.author = req.user._id;
newPost.readableDate = currentDate.getMonth()+"/"+currentDate.getDay()+"/"+currentDate.getFullYear();

// save the user
newPost.save(function (err) {
    if (err) {
        console.log('Error in Saving user: ' + err);
        throw err;
    }
    if (!err) {
        Post.find()
            .populate('author')
            .exec(function (err, posts) {
                console.log(JSON.stringify(posts, null, "\t"))
            });
        res.redirect('/');
    }
});
});

//API for deleting posts
app.get('/delpost/:id', isAdmin, function (req, res) {
Post.find({ '_id': req.params.id })
    .remove()
    .exec(function (err) {
        if (err) {
            return done(err);
        }
        res.redirect('/');
    });
});

//API for creating new events through HTTP POST
app.post('/newevent', isAdmin, function (req, res) {
var title = req.body.name;
var text = req.body.desc;
var date = req.body.date;
var duration = req.body.dur;

var newEvent = new Event();
newEvent.name = title;
newEvent.desc = text;
newEvent.date = date;
newEvent.happens = new Date(date);
newEvent.duration = duration;

//save the user
newEvent.save(function (err) {
    if (err) {
        console.log('Error in Saving user: ' + err);
        throw err;
    }
    res.redirect('/');
});
});

//API for deleting events
app.get('/delevent/:id', isAdmin, function (req, res) {
Event.find({ '_id': req.params.id })
    .remove()
    .exec(function (err) {
        if (err) {
            return done(err);
        }
        res.redirect('/members');
    });
});

//API for READing User data
app.get('/member/:id', isAdmin, function (req, res) {
User.findOne({ '_id': req.params.id },
    function (err, user) {
        // In case of any error, return using the done method
        if (err) {
            return done(err);
        }
        res.render('member', {
            user: user,
            admin: req.user.admin
        })
    }
);
});

//API for READing Event data
app.get('/event/:id', isRegistered, function (req, res) {
Event.findOne({ '_id': req.params.id },
    function (err, event) {
        // In case of any error, return using the done method
        if (err) {
            return done(err);
        }
        if (req.user.events.indexOf(req.params.id) > -1) {
            console.log('This event is in your events');
            if (req.user.admin) {
                res.render('event', {
                    event: event,
                    admin: true
                })
            } else {
                res.render('event', {
                    event: event
                })
            }
        } else {
            console.log('This event is not your events');
            if (req.user.admin) {
                res.render('event', {
                    event: event,
                    admin: true,
                    inevents: 'no'
                })
            } else {
                res.render('event', {
                    event: event,
                    inevents: 'no'
                })
            }
        }
    }
);
});

//API for adding Events to Users
app.get('/addevent/:id', isRegistered, function (req, res) {
User.findByIdAndUpdate(
    req.user,
    { $push: { 'events': req.params.id } },
    { safe: true, upsert: true, new: true },
    function (err, user) {
        if (err) {
            console.log(err);
            return done(err);
        }
        User.find({})
            .populate('events')
            .exec(function (err, user) {
                console.log(JSON.stringify(user, null, "\t"));
            });
        res.redirect('/members');
    }
);
});

//API for removing Events from Users
app.get('/rmevent/:id', isRegistered, function (req, res) {
User.findByIdAndUpdate(
    req.user,
    { $pull: { 'events': req.params.id } },
    { safe: true, upsert: true, new: true },
    function (err, user) {
        if (err) {
            console.log(err);
            return done(err);
        }
        User.find({})
            .exec(function (err, user) {
                console.log(JSON.stringify(user, null, "\t"));
            });
        res.redirect('/members');
    }
);
});

//API for UPDATING User password field w/password verification & admin privileges
app.post('/resetpwd/:id', isRegistered, function (req, res) {
User.findOne({ '_id': req.params.id })
    .exec(function (err, user) {
        if (err) {
            return done(err);
        }
        console.log('old password hash is : ' + user.password);
        if (req.user.admin) {
            User.findOneAndUpdate({ '_id': req.params.id }, {
                $set:
                {
                    password: createHash(req.body.password)
                }
            }, function (err, user) {
                console.log('password has reset to: ' + user.password);
                req.flash('resetPass', 'Successfully Changed Password');
                res.redirect("/");
            });
        } else {
            if (bCrypt.compareSync(req.body.oldpass, user.password)) {
                User.findOneAndUpdate({ '_id': req.params.id }, {
                    $set: {
                        password: createHash(req.body.password)
                    }
                }, function (err, user) {
                    console.log('password has reset to: ' + user.password);
                    req.flash('resetPass', 'Successfully Changed Password');
                    res.redirect("/");
                });
            } else {
                req.flash('message', 'Incorrect Old Password');
                res.render('resetpwd', { message: req.flash('message') });
            }
        }
    });
});

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