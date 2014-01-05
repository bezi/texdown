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
app.use(express.cookieParser('your secret here'));
app.use(express.session());
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
app.get('/', require('./routes/index'));
// about
app.get('/about', require('./routes/infoPage').about);
// contact
app.get('/contact', require('./routes/infoPage').contact);
// files
app.get('/files', require('./routes/files')(db));
// edit
app.get('/edit', require('./routes/edit')(db));
// save
app.post('/save', require('./routes/save')(db));
// view
app.get('/view', require('./routes/view')(db));
// preview
// app.post('/preview', require('./routes/preview'));
app.get('/preview', require('./routes/preview')(db));
// compile
app.post('/compile', require('./routes/compile'));

app.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
