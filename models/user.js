var mongodb=require('./db');
var settings = require('../settings.js');
function User(user){
	this.name=user.name;
	this.password=user.password;
};

module.exports=User;

User.prototype.save=function save(callback){
	//存入Mongodb的文档
	var user={
		name:this.name,
		password:this.password,
	};
	mongodb.open(function(err,db){
		db.authenticate(settings.username, settings.password, function(err, result) {
			if(err){
				mongodb.close();
        		//res.end('Authenticate failed!');
				return callback(err);
			}
			//读取users集合
			db.collection('users',function(err,collection){
				if(err){
					mongodb.close();
					return callback(err);
				}
				//为name属性添加索引
				//collection.ensureIndex('name',{unique:true});
				collection.ensureIndex('name', {unique: true}, function(err, user) {});

				//写入user文档
				collection.insert(user,{safe:true},function(err,user){
					mongodb.close();
					callback(err,user);
				});
			});
			
		});
		
	});
	
};

User.get=function get(username,callback){
	mongodb.open(function(err,db){
		db.authenticate(settings.username, settings.password, function(err, result) {
			if(err){
				mongodb.close();
        		//res.end('Authenticate failed!');
				return callback(err);
			}
			//读取users集合
			db.collection('users',function(err,collection){
				if(err){
					mongodb.close();
					return callback(err);
				}
				//查找name属性为username的文档
				collection.findOne({name:username},function(err,doc){
					mongodb.close();
					if(doc){
						//封装文档为User对象
						var user=new User(doc);
						callback(err,user);
					}else{
						callback(err,null);
					}
				});

			});

		});
		
	});
};