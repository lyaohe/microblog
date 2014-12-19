
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var partials=require('express-partials');
//var userlist=require('./routes/userlist');
var http = require('http');
var path = require('path');
var settings=require('./settings');
var SessionStore=require('session-mongoose')(express);
var flash = require('connect-flash');
//var mongoose=require('./mongoose.js');
var mongoose = require('mongoose');
var dbUrl = 'mongodb://';
dbUrl += settings.username + ':' + settings.password + '@';
dbUrl += settings.host + ':' + settings.port;
dbUrl += '/' + settings.db;
mongoose.connect(dbUrl, {server: {auto_reconnect:true}});

mongoose.connection.on('close', function(){
	mongoose.connect(dbUrl, {server:{auto_reconnect:true}});
});
mongoose.connection.on('error', function(error){
	console.log('error + ' + error);
	mongoose.disconnect();
});


var store = new SessionStore({
	interval: 120000,
	connection:mongoose.connection
});
/*
var sessionStore=new MongoStore({
	db:settings.db
},function(){
	console.log('connect mongodb success...');
});
*/


var app = express();



// all environments
app.configure(function() {
	app.set('port', 18080);
	app.set('views', path.join(__dirname, 'views'));
	app.set('view engine', 'ejs');
	app.use(partials());
	app.use(express.favicon());
	app.use(express.logger('dev'));
	//app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.methodOverride());

	app.use(express.cookieParser());
	app.use(flash());
	app.use(express.session({
		secret:settings.cookieSecret,
		store: store,
		cookie: { maxAge: 900000 }
	}));
	app.use(function(req, res, next){
	  var error = req.flash('error');
	  var success = req.flash('success');
	  res.locals.user = req.session.user;
	  res.locals.error = error.length ? error : null;
	  res.locals.success = success.length ? success : null;
	  next();
	});
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}





routes(app);
//app.get('/', routes.index);
//app.get('/users', user.list);
//app.get('/u/:user',routes.user);
//app.get('/post',routes.post);
//app.get('/login',routes.login_get);
///app.post('/reg',routes.reg);
//app.post('/login',route.login);
//app.get('/logout',routes.logout);
//app.get('/userlist', routes.userlist);
/*
app.dynamicHelpers({
	user:function(req,res){
		return req.session.user;
	},
	error:function(req,res){
		var err = req.flash('error');
		if(err.length){
			return err;
		}else{
			return null;
		}
	},
	success:function(req,res){
		var succ=req.flash('success');
		if(succ.length){
			return succ;
		}else{
			return null;
		}
	}
});*/
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
