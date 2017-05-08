'use strict'

//import dependencies
var express = require('express'),
    mongoose = require('mongoose'),
    bodyParser = require('body-parser'),
    Comment = require('./model/comments');


mongoose.connect('mongodb://localhost/mern-comment-app');

//create instances
var app = express(),
    router = express.Router();

// set port to env or 4000
var port = process.env.PORT || 4000;


//config API to use bodyParser and look for JSON in req.body
app.use(bodyParser.urlencoded({extended: true }));
app.use(bodyParser.json());

//Prevent CORS errors
app.use(function(req, res, next) {
  console.log('received request', req.method, req.url)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');

  //Remove caching
  res.setHeader('Cache-Control', 'no-cache');
  next();
});




var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:4000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('profile', profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/plus.login']
  })
);

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    console.log('redirect')
    res.redirect('/');
  });






app.get('/', function(req,res){
  res.send('server running');
})

//set route path and init API
router.get('/', function(req,res) {
  res.json({message: 'API Initialized!'});
});

// delete all comments
router.route('/nuke').get(function(req,res){
  Comment.remove(function(err,succ){
  res.json(succ);
  });
});

//adding the /comments route to our /api router
router.route('/comments')
  //retrieve all comments from the database
  .get(function(req, res) {
    //looks at our Comment Schema
    Comment.find(function(err, comments) {
      if (err)
        res.send(err);
      //responds with a json object of our database comments.
      res.json(comments)
    });
  })
  //post new comment to the database
  .post(function(req, res) {
    var comment = new Comment();
    //body parser lets us use the req.body
    comment.author = req.body.author;
    comment.text = req.body.text;

    comment.save(function(err) {
      if (err){
        res.send(err);
      } else {
        res.json(comment);
      }
    });
  });

  router.route('/comments/:comment_id')
  //The put method gives us the chance to update our comment based on the ID passed to the route
   .put(function(req, res) {
     Comment.findById(req.params.comment_id, function(err, comment) {
       if (err)
         res.send(err);
       //setting the new author and text to whatever was changed. If nothing was changed
       // we will not alter the field.
       (req.body.author) ? comment.author = req.body.author : null;
       (req.body.text) ? comment.text = req.body.text : null;
       //save comment
       comment.save(function(err) {
         if (err)
           res.send(err);
         res.json({ message: 'Comment has been updated' });
       });
     });
   })
   //delete method for removing a comment from our database
   .delete(function(req, res) {
     //selects the comment by its ID, then removes it.
     Comment.remove({ _id: req.params.comment_id }, function(err, comment) {
       if (err)
         res.send(err);
       res.json({ message: 'Comment has been deleted' })
     })
   });

//use router config when we call /API
app.use('/api', router);


//start server
app.listen(port, function() {
  console.log(`api running on port ${port}`);
});
