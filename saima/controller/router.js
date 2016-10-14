/**
 * Created by lv-juan on 2016/6/28.
 */
var redis = require("redis");
var path=require("path");
var mysql = require('mysql');
var uuid = require('node-uuid');
var pool = mysql.createPool({
    host: '101.200.113.40',
    user: 'yunshi',
    password: 'zFpVu4JmPZSIfbLa',
    database: 'saima',
    port: 3306
});

exports.showIndex=function(req,res){
    var user_info=req.cookies;
    if(user_info.name){
        res.render("index")
    }else{
        res.render("login",{msg:"用户名或者密码不存在"})
    }
};

exports.video_paly=function(req,res){
    var user_info=req.cookies;
    if(user_info.name){
        res.render("video",{});
    }else{
        res.render("login",{msg:"用户名或者密码不存在"})
    }

};


module.exports.login=function(req,res){
    res.render("login",{msg:""})
};
module.exports.manage=function(req,res){
    var user_info=req.cookies;
    if(user_info.name=="manage"){
        res.render("manage")
    }else{
        res.render("login",{msg:"用户名或者密码不存在"})
    }
};
module.exports.user_list_page=function(req,res){
    var user_info=req.cookies;
    if(user_info.name&&user_info.name=="manage"){
        res.render("user")
    }else{
        res.render("login",{msg:"用户名或者密码不存在"})
    }
};
//查询所有用户列表的返回json格式数据
module.exports.user_list_json=function(req,res){
    var pageIndex=req.query.page||1;
    console.info(pageIndex);
    pageIndex-=1;
    var row=req.query.rows||20;
    getCount("customer",function(err,total){
        if(err){
            console.info(err);
            res.json({total:0,rows:[]})
        }
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                // res.json({"code" : 100, "status" : "Error in connection database"});
                console.info("数据库连接异常");
                res.json({total:0,rows:[]});
                return;
            }
            connection.query("select * from customer order by name limit "+parseInt(pageIndex)*row+" ,"+parseInt(row)+"  ",function(err,rows){
                connection.release();
                if(!err) {
                    res.json({total:total,rows:rows});
                }
            });
            connection.on('error', function(err) {
                console.info("数据库连接异常");
                res.json({total:0,rows:[]});
                return;
            });
        });
    })
};


module.exports.check_login=function(req,res){
    var name=req.query.name;
    var pwd =req.query.pwd;
    if(name&&pwd){
        var sql = "";
        if(name==="manage"){
            sql = "select  *  from sys_user where name='manage' and password='"+pwd+"' ";
        }else{
            sql="select id,name from customer where name='"+name+"' and password= '"+pwd+"' and type=1 and status=1 ";
        }
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                console.info("数据库连接异常");
                res.json({total:1});
                return;
            }
            connection.query(sql,function(err,rows){
                connection.release();
                if(!err) {
                   if(rows.length>0){
                       res.cookie('name', rows[0].name);
                       res.cookie('user_id', rows[0].id);
                       if(name==='manage'){
                           res.json({ret:0,url:"manage"});
                       }else{
                           res.json({ret:0,url:"video",user_id:rows[0].id})
                       }
                   }else{
                       res.json({ret:1});
                   }
                }
            });
            connection.on('error', function(err) {
                console.info("数据库连接异常");
                res.json({ret:1});
                return;
            });
        });
    }else{
        res.json({ret:1})
    }
}
//保存用户信息
module.exports.save_users=function(req,res){
    var time2 = new Date().Format("yyyy-MM-dd hh:mm:ss");
    var name=req.params.name;
    var password=req.params.pwd;
    if(name && password){
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
            }
            connection.query('insert into customer (id,name,password,create_time) values("'+uuid.v1()+'","'+name+'","'+password+'","'+time2+'") ',function(err,rows){
                connection.release();
                if(err) {
                    console.info(err);
                    res.json({ret:1})
                }else{
                    res.json({ret:0})
                }
            });
            connection.on('error', function(err) {
                console.info(err)
                res.json({ret:1});
                return;
            });
        });
    }else{
        res.json({ret:1})
    }
};

module.exports.delete_user=function(req,res){
    var key=req.params.id;
    if(key){
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
            }
            console.log('当前线程Id ' + connection.threadId);
            connection.query('delete  from customer where id="'+key+'" ',function(err,rows){
                connection.release();
                if(err) {
                    console.info(err)
                    res.json({ret:1})
                }else{
                    res.json({ret:0})
                }
            });
            connection.on('error', function(err) {
                console.info(err)
                res.json({ret:1});
                return;
            });
        });
    }else{
        res.json({ret:1})
    }


};

module.exports.close_page=function(req,res){
    res.json({ret:0})
}

module.exports.save_user_login_status=function(req,res){
var  client = redis.createClient(6179, "120.27.51.170");
    var user_info=req.cookies;
    if(user_info.name){
        client.get(user_info.name, function(err, reply){
            if(err){
                res.json({ret:1})
            }
            //如果密码正确
            if(reply){
                var dl_key=user_info.name+"_dlkang";
                client.set(dl_key, user_info.pwd, function(err, reply){
                    if(err){
                        console.info("缓存登录信息失败");
                        res.json({ret:1})
                    }
                    if(reply){
                        console.info("缓存登录信息成功");
                        res.json({ret:0})
                    }
                });
                client.expire(dl_key,10);
            }else{
                res.json({ret:1})
            }
        });

    }
};
//冻结
module.exports.dj_user=function(req,res){
    var user_name=req.params.name;
    var pwd=req.params.pwd;
    var  client = redis.createClient(6179, "120.27.51.170");
    client.del(user_name, function(err, reply){
        if(err){
            res.json({ret:1})
        }
        if(reply){
            client.set(user_name+"_dj", pwd, function(err2, reply1){
                if(err2){
                    res.json({ret:1})
                }
                if(reply1){
                    res.json({ret:0})
                }
            });
        }

    });
}

//冻结
module.exports.stop_user=function(req,res){
    var user_name=req.params.name;
    var user_name1=user_name.substr(0,user_name.indexOf("_dlkang"));
    var pwd=req.params.pwd;
    var  client = redis.createClient(6179, "120.27.51.170");
    client.del(user_name1, function(err, reply){
        if(err){
            res.json({ret:1})
        }
        if(reply){
            client.set(user_name1+"_dj", pwd, function(err2, reply1){
                if(err2){
                    res.json({ret:1})
                }
                if(reply1){
                    res.json({ret:0})
                }
            });
        }

    });
}
//释放
module.exports.ok_user=function(req,res){
    var user_name=req.params.name;
    var pwd=req.params.pwd;
    var  client = redis.createClient(6179, "120.27.51.170");
    client.del(user_name, function(err, reply){
        if(err){
            res.json({ret:1})
        }
        if(reply){
            client.set(user_name.substr(0,user_name.lastIndexOf("_dj")), pwd, function(err2, reply1){
                if(err2){
                    res.json({ret:1})
                }
                if(reply1){
                    res.json({ret:0})
                }
            });
        }

    });
}


//获取某个表中数据的总数量
function getCount(tableName,callbck){
    pool.getConnection(function(err,connection){
        if (err) {
            console.info("Error in connection database");
            connection.release();
            callback("Error in connection database");
        }
        connection.query("select count(*) as num  from "+tableName+" ",function(err,rows){
            connection.release();
            if(!err) {
                callbck(null,rows[0].num)
            }else{
                console.info(err)
                callbck(err)
            }
        });
        connection.on('error', function(err) {
            console.log(err);
            console.log("Error in connection database");
            callbck("Error in connection database")
        });
    });
}

//冻结用户


module.exports.frozen_user=function(req,res){
    var id=req.params.id;
    if(id){
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
            }
            console.log('当前线程Id ' + connection.threadId);
            connection.query('update customer set type=2 where id="'+id+'" ',function(err,rows){
                connection.release();
                if(err) {
                    console.info(err)
                    res.json({ret:1})
                }else{
                    res.json({ret:0})
                }
            });
            connection.on('error', function(err) {
                res.json({ret:1});
                return;
            });
        });
    }else{
        res.json({ret:1});
    }
}
//解冻用户
module.exports.unfrozen_user=function(req,res){
    var id=req.params.id;
    if(id){
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
            }
            console.log('当前线程Id ' + connection.threadId);
            connection.query('update customer set type=1 where id="'+id+'" ',function(err,rows){
                connection.release();
                if(err) {
                    console.info(err)
                    res.json({ret:1})
                }else{
                    res.json({ret:0})
                }
            });
            connection.on('error', function(err) {
                res.json({ret:1});
                return;
            });
        });
    }else{
        res.json({ret:1});
    }
}






















Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}