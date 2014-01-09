//===============================================
// modules
//===============================================
var express = require('express');
var path = require('path');
var app = express();

var mongo = require('mongodb');
var monk = require('monk');
var db = monk('mongodb://texdown:asdf@ds059888.mongolab.com:59888/texdown');

//===============================================
// authentication
//===============================================
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var GOOGLE_CLIENT_ID = "383913450954-s1m28ea0b4f5u30inmjns6q8q324h3g4.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "bGcCd7EwUd13BMXNcoc4Nsw6"; 

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

//===============================================
// config
//===============================================

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('meowsers'));
app.use(express.session());
//passport
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  app.locals.pretty = true;
}

//===============================================
// routes
//===============================================

// home
app.get('/', require('./routes/index')(db));
// edit
// without a fileid they get redirected home
app.get('/edit', ensureAuthenticated, require('./routes/index'));
app.get('/edit/:id', ensureAuthenticated, require('./routes/edit')(db));
// save
app.post('/save', ensureAuthenticated, require('./routes/save')(db));
// compile
app.post('/compile', require('./routes/compile'));
// rename
app.post('/rename', require('./routes/rename')(db));
// delete
app.post('/delete', require('./routes/delete')(db));
// newfile
app.post('/newfile', require('./routes/newfile')(db));

// authentication
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }),
  function(req, res){
  });

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
