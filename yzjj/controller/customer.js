/**
 * Created by lv-juan on 2016/10/30.
 */
var path=require("path");
var mysql = require('mysql');
const config = require('../config.json');
var log = require("../log").logger("customer"); // logger中的参数随便起
var pool =mysql.createPool({
    "connectionLimit":5,
    "host": "101.200.113.40",
    "user"     : "yunshi",
    "password" : "zFpVu4JmPZSIfbLa",
    "database" : "yzjj",
    "port":3306
});
module.exports.edit_customer_info=function(req,res){
    var id=req.body.id;
    var name=req.body.name;
    var desc=req.body.description;
    if(id && name){
        var sql="update customer set name = '"+name+"' where id='"+id+"'"
        if(desc){
            sql="update customer set name = '"+name+"' ,description='"+desc+"' where id='"+id+"'"
        }
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                res.json({"code" : 100, "status" : "Error in connection database"});
                return;
            }
            log.info('当前线程id ' + connection.threadId);
            connection.query(sql,function(err,rows){
                connection.release();
                if(!err) {
                    console.info(JSON.stringify(rows));
                    if(rows.affectedRows==1){
                        res.json({ret:0})
                    }else{
                        res.json({ret:1})
                    }
                }else{
                    res.json({ret:1})
                }
            });
            connection.on('error', function(err) {
                console.info("数据库连接错误。。。。")
                res.json({ret:1})
                return;
            });
        });
    }else{
        res.json({ret:1,msg:"参数不全"})
    }
};

//根据用户id 获取用户信息
module.exports.get_customer_info_by_id=function(req,res){
    var id=req.params.id;
    if(id && id.length==32){
        var sql="select * from customer where id='"+id+"' ";
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                res.json({"ret" : 100, "status" : "Error in connection database"});
                return;
            }
            log.info('当前线程id ' + connection.threadId);
            connection.query(sql,function(err,rows){
                connection.release();
                if(!err) {
                    console.info(JSON.stringify(rows));
                    if(rows[0]){
                        res.json({ret:0,obj:rows[0]})
                    }else{
                        res.json({ret:1,msg:"网络异常，更新失败"})
                    }
                }else{
                    res.json({ret:1,msg:"服务器异常，请稍候。"})
                }
            });
            connection.on('error', function(err) {
                console.info("数据库连接错误。。。。");
                res.json({ret:1})
                return;
            });
        });
    }else{
        res.json({ret:1,msg:"参数格式不正确"})
    }
};
//根据用户id 获取用户信息
module.exports.get_all_register_count=function(req,res){
    var sql="select count(*) as num from customer";
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            res.json({"ret" : 100, "status" : "Error in connection database"});
            return;
        }
        connection.query(sql,function(err,rows){
            connection.release();
            if(!err) {
                log.info(JSON.stringify(rows));
                if(rows[0]){
                    res.json({ret:0,count:rows[0].num})
                }else{
                    res.json({ret:1})
                }
            }else{
                res.json({ret:1})
            }
        });
        connection.on('error', function(err) {
            console.info("数据库连接错误。。。。");

            res.json({ret:1})
            return;
        });
    });
}

//根据用户Id 删除用信息。慎用
module.exports.delete_user_by_id=function(req,res){
     var user_cookie=req.cookies;
    console.info(JSON.stringify(user_cookie));
    var id=req.params.id;
    if(user_cookie.username=='admin'){
        if(id && id.length==32){
            var sql="delete  from customer where id='"+id+"'";
            pool.getConnection(function(err,connection){
                if (err) {
                    connection.release();
                    res.json({"ret" : 100, "status" : "Error in connection database"});
                    return;
                }
                connection.query(sql,function(err,rows){
                    connection.release();
                    if(!err) {
                        console.info(JSON.stringify(rows));
                        if(rows[0]){
                            res.json({ret:0})
                        }else{
                            res.json({ret:1})
                        }
                    }else{
                        res.json({ret:1})
                    }
                });
                connection.on('error', function(err) {
                    console.info("数据库连接错误。。。。");
                    res.json({ret:1})
                    return;
                });
            });
        }else{
            res.json({ret:1,msg:"参数不正确"})
        }
    }else{
        res.json({ret:1,msg:"您没有删除权限"})
    }
}

//根据当前日期获取当前日期的注册数据
module.exports.get_all_register_count_by_time=function(req,res){
    var time=req.params.time;
    var tomorrow=new Date(new Date(time).getTime()+60*1000*60*24).Format('yyyy-MM-dd');
    var sql ="select count(*) as count from customer where create_time>'"+time+"' and create_time<'"+tomorrow+"'";
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            log.error('连接失败，数据库链接异常 ');
            res.json({"ret" : 100, "status" : "Error in connection database"});
            return;
        }
        connection.query(sql,function(err,rows){
            connection.release();
            if(!err) {
                log.info(JSON.stringify(rows));
                if(rows[0]){
                    res.json({ret:0,count:rows[0].count})
                }else{
                    res.json({ret:1})
                }
            }else{
                res.json({ret:1})
            }
        });
        connection.on('error', function(err) {
            log.error('数据库连接错误。。。。');
            res.json({ret:1});
            return;
        });
    });
}


//扩张日期类
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