//===============================================
// modules
//===============================================
var express = require('express');
var path = require('path');
var app = express();

var mongo = require('mongodb');
var monk = require('monk');
var db = monk(process.env.TEXDOWN_MONGOLAB_URL);
db.ObjectID = mongo.ObjectID;

//===============================================
// authentication
//===============================================
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var GOOGLE_CLIENT_ID = process.env.TEXDOWN_GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.TEXDOWN_GOOGLE_CLIENT_SECRET; 

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var callbackURL;
if (process.env.TEXDOWN_PRODUCTION) {
    console.log("Production environment found.");
    callbackURL = "http://texdown.org/auth/google/callback"
} else {
    console.log("Development environment found.");
    callbackURL = "http://127.0.0.1:3000/auth/google/callback"
}

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        return done(null, profile);
    });
}));

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

var files = require('./routes/files')(db);

// home
app.get('/', require('./routes/index')(db));
// files
app.post('/files', files.post);
app.get('/files', files.get);
app.get('/files/:id', files.get);
app.put('/files/:id', files.put);
app.delete('/files/:id', files.delete);
// edit
app.get('/edit', require('./routes/edit')(db));
app.get('/edit/:id', require('./routes/edit')(db));
// settings
app.get('/settings', ensureAuthenticated, require('./routes/settings').get(db));
app.post('/settings', ensureAuthenticated, require('./routes/settings').post(db));
// about
app.get('/about', require('./routes/about'));

// authentication
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile'] }),
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
