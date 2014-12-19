#Microblog - BAE  

《node.js开发指南》的Mircroblog案例应用,能完美部署到BAE上运行.  

在部署到BAE上遇到2个问题,都完美解决了.

## 2个问题

### db auth
- mongodb数据库的用户名和密码验证

参考了BAE的mongodb连接的node.js代码,轻松能解决

<http://developer.baidu.com/wiki/index.php?title=docs/cplat/bae/mongodb#Node.js>


### session
- 使用mongodb来存储session,此操作是长连接,BAE不允许长连接,会到出现500或501错误

在多番查找和研究,把connect-mongo和session-mongoose两个模块的github文档来了一偏又一遍来研究如何短连接或断开后重连.

尽管我一开始用connect-mongo,都改成用session-mongoose,因为看到session-mongoose有interval参数

但使用session-mongoose的连接数据库方式是`mongodb://localhost/session`,怎样写数据库的用户名和密码呢.

经多番查找,原来是这样写的:`mongodb://username:password@host/database`,瞬间觉得世界还是很美好.

按着文档,把代码修改好,满怀希望能成功,但经测试,还是失败了,没多久又挂了.

还以为interval间隔时间太长,改到28秒(28000),经测试还是挂,改为20秒(20000),依然挂,世界还是太残忍了.

研究报错时,感觉mongoose断开后,不会重连,只好写一下重连方法.

	var settings=require('./settings');

	var mongoose = require('mongoose');
	var dbUrl = 'mongodb://';
	dbUrl += settings.username + ':' + settings.password + '@';
	dbUrl += settings.host + ':' + settings.port;
	dbUrl += '/' + settings.db;
	mongoose.connect(dbUrl, {server: {auto_reconnect:true}});
	
	//监听数据库连接关闭后,重连
	mongoose.connection.on('close', function(){
		mongoose.connect(dbUrl, {server:{auto_reconnect:true}});
	});
	//监听数据库出现错误后,重连
	mongoose.connection.on('error', function(error){
		console.log('error + ' + error);
		mongoose.disconnect();
	});

	var SessionStore=require('session-mongoose')(express);
	var store = new SessionStore({
		interval: 120000,
		connection:mongoose.connection
	});

	app.use(express.session({
		secret:settings.cookieSecret,
		store: store,
		cookie: { maxAge: 900000 }
	}));

经本地测试,没问题后,上传到BAE测试,终于终于成功了,世界又变美好了.

