/**
 * Created by lv-juan on 2016/6/28.
 */
var formidable=require('formidable');
var path=require("path");
var mysql = require('mysql');
var uuid = require('node-uuid');
var fs=require('fs')
var pool=mysql.createPool({
    connectionLimit : 5, //important
    host     : '100.98.161.189',
    user     : 'yunshi',
    password : 'zFpVu4JmPZSIfbLa',
    database : 'yzjj',
    port:'3306'
});
exports.showIndex=function(req,res){
    res.render("index");
};

exports.about=function(req,res){
    res.render("about");
};
exports.project=function(req,res){
    res.render("project");
};


module.exports.manage=function(req,res){
    var user_info=req.cookies;
    if(user_info.name=="admin"){
        res.render("manage")
    }else{
       // res.writeHead(200, {"Content-Type": "text/plain"});
        //res.end(fs.readFileSync(path(__dirname + "../../views/index.ejs")));
        //res.set("Content-Type","text/html");
        res.render("login",{msg:"用户名或者密码不存在"})
    }
};

module.exports.save_users=function(req,res){
    var form = new formidable.IncomingForm();
    var time2 = new Date().Format("yyyy-MM-dd hh:mm:ss");
    form.parse(req, function(err, fields, files) {
        if(fields.phone){
            pool.getConnection(function(err,connection){
                if (err) {
                    connection.release();
                    res.json({"code" : 100, "status" : "Error in connection database"});
                    return;
                }
                console.log('当前线程Id ' + connection.threadId);
                connection.query('insert into message_book (id,phone,title,description,create_time) values("'+uuid.v1()+'","'+fields.phone+'","'+fields.title+'","'+fields.description+'","'+time2+'") ',function(err,rows){
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
        }
    });
}


module.exports.check_login=function(req,res){
    var name=req.query.name;
    var pwd =req.query.pwd;
    if(name&&pwd){
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
            }
            console.log('connected as id ' + connection.threadId);
            connection.query('select * from sys_admin where user_name="'+name+'" and password ="'+pwd+' " ',function(err,rows){
                connection.release();
                if(!err) {
                    console.info(JSON.stringify(rows))
                    if(rows[0]){
                         res.cookie('name', rows[0].user_name);
                        res.json({ret:0})
                    }else{
                        res.json({ret:1})
                    }
                }else{
                    res.json({ret:1})
                }
            });
            connection.on('error', function(err) {
                //res.json({"code" : 100, "status" : "Error in connection database"});
                console.info("数据库连接错误。。。。")
                res.json({ret:1})
                return;
            });
        });
    }else{
        res.json({ret:1})
    }
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
                console.info(rows)
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
