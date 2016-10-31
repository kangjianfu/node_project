/**
 * Created by lv-juan on 2016/10/30.
 */
var formidable=require('formidable');
var path=require("path");
var mysql = require('mysql');
const config = require('../config.json');
const TopClient = require('../topClient').TopClient;
var client = new TopClient(config.sms_config);
var pool =mysql.createPool({
    "connectionLimit":5,
    "host": "101.200.113.40",
    "user"     : "yunshi",
    "password" : "zFpVu4JmPZSIfbLa",
    "database" : "yzjj",
    "port":3306
});
const templates = [
    "SMS_24965142",//注册
    "SMS_24900087", //亚洲掘金(测试用)
    "SMS_24840105" //修改密码验证码
];
//手机登录和注册js验证
var check_phone=function(phone){
    var reg=/^1[3|5|7|8]\d{9}$/;
    return reg.test(phone)
};
//发送注册手机验证码
module.exports.send_phone_msg_by_register=function(req,res){
    var phone=req.params.phone;
    var sms_code=Math.random().toString().replace(".","").substr(3,6);
    if(check_phone(phone)){
        //验证手机号码是否已注册（如果已注册，提示已注册。）
        check_phone_exist(phone,function(err,result){
            if(err){
                res.json(err);
            }
            if(result>0){
                res.json({ret:1,msg:"该号码已经注册"})
            }else{
                client.execute('alibaba.aliqin.fc.sms.num.send', {
                        'fields':'sms_type, sms_free_sign_name,sex,location',
                        'sms_type':'norma',
                        'sms_free_sign_name':'亚洲掘金',
                        'rec_num': phone,
                        'sms_template_code': templates[0],
                        'sms_param': {
                            "number": sms_code,
                            "product": "亚洲掘金"
                        }
                    },
                    function (error, sms_response) {
                        if(error) {
                            console.info('发送验证码失败。 ' + error);
                            res.json({ret:4,msg:"获取太频繁，请稍候。"})
                        } else {
                            console.info("验证码发送成功");
                            console.info(sms_response);
                            pool.getConnection(function(err,connection){
                                if (err) {
                                    connection.release();
                                    return;
                                }
                                console.log('当前线程Id ' + connection.threadId);
                                connection.query('call save_phone_msg("'+phone+'","'+sms_code+'")',function(err,rows){
                                    connection.release();
                                    if(err) {
                                        console.info(err);
                                    }else{
                                        console.info("验证码保存到数据库。。。。。。。。。。"+JSON.stringify(rows));
                                    }
                                });
                                connection.on('error', function(err) {
                                    console.info(err);
                                });
                            });
                            res.json({ret:0})
                        }
                    }
                );
            }
        });
    }else{
        res.json({"ret":1,"msg":"手机号格式不正确。"})

    }
};

//验证手机号码是否存在
function check_phone_exist(phone,callback){
    pool.getConnection(function(err,connection){
        if (err) {
            console.info(err);
            connection.release();
            callback({ret:1,msg:"网络异常"},null);
            return;
        }
        console.log('当前线程Id ' + connection.threadId);
        connection.query('select count(*) as count from customer where phone ="'+phone+'"',function(err,rows){
            connection.release();
            if(err) {
                console.info(err);
                callback({ret:1,msg:"网络异常"},null);
            }else{
                console.info("查询结果。。。。。。。。。。"+JSON.stringify(rows));
                callback(null,rows[0].count)
            }
        });
        connection.on('error', function(err) {
            console.info(err);
            callback({ret:1,msg:"网络异常"},null);
        });
    });
};

//保存用户注册信息
module.exports.register_customer_account=function(req,res){
    var phone =req.params.phone;
    var password =req.params.password;
    var code=req.params.code;
    if(phone&&password&&code){
        if(password.length>100){
            res.json({ret:1,msg:"密码太长，长度小于100位"});
            return;
        }
        if(code.length>50){
            res.json({ret:1,msg:"验证码格式不正确"});
            return;
        }
        if(check_phone(phone)){
            pool.getConnection(function(err,connection){
                if (err) {
                    connection.release();
                    res.json({ret:2,msg:"服务异常"})
                    //res.json({"code" : 100, "status" : "Error in connection database"});
                    return;
                }
                console.log('当前线程Id ' + connection.threadId);
                connection.query('call register_customer_account("'+phone+'","'+password+'","'+code+'")',function(err,rows){
                    connection.release();
                    if(err) {
                        console.info(err)
                        res.json({ret:1})
                    }else{
                        var msg_code=rows[0][0]._result;
                        switch(msg_code){
                            case 0:
                                res.json({ret:0});
                                break;
                            case 1:
                                res.json({ret:msg_code,msg:"手机号码已存在"});
                                break;
                            case 2:
                                res.json({ret:msg_code,msg:"验证码不正确"});
                                break;
                            case 3:
                                res.json({ret:msg_code,msg:"验证码已过期"});
                                break;
                            case 4:
                                res.json({ret:msg_code,msg:"验证码不存在"});
                                break;
                            default:
                                res.json({ret:8,msg:"网络异常，请稍候重试"});
                        }
                    }
                });
                connection.on('error', function(err) {
                    console.info(err)
                    res.json({ret:1});
                    return;
                });
            });
        }

    }else{
        res.json({ret:1,msg:"参数不全，请检查参数"})
    }
}
///用户登录
module.exports.user_login=function(req,res){
    var phone=req.params.phone;
    var password=req.params.password;
    if(phone&&password){
        if(password.length>100){
            res.json({ret:1,msg:"密码太长，长度小于100位"});
            return;
        }
        if(check_phone(phone)){
            pool.getConnection(function(err,connection){
                if (err) {
                    connection.release();
                    res.json({ret:2,msg:"服务异常"})
                    return;
                }
                console.log('当前线程Id ' + connection.threadId);
                connection.query('select * from customer where phone="'+phone+'" and password="'+password+'" ',function(err,rows){
                    connection.release();
                    if(err) {
                        console.info(err)
                        res.json({ret:9,msg:"网络异常"})
                    }else{
                        console.info(JSON.stringify(rows))
                        if(rows[0]){
                            res.json({ret:0})
                        }else{
                            res.json({ret:1,msg:"账户或密码错误"})
                        }
                    }
                });
                connection.on('error', function(err) {
                    res.json({ret:1});
                    return;
                });
            });
        }
    }else{
        res.json({ret:1,msg:"参数不全，请检查参数"})
    }
};

//修改密码 发送验证码
module.exports.send_phone_msg_by_update_pwd=function(req,res){
    var phone=req.params.phone;
    var sms_code=Math.random().toString().replace(".","").substr(3,6);
    if(check_phone(phone)){
        //验证手机号码是否已注册（如果已注册，提示已注册。）
        check_phone_exist(phone,function(err,result){
            if(err){
                res.json(err);
            }
            if(result==1){
                client.execute('alibaba.aliqin.fc.sms.num.send', {
                        'fields':'sms_type, sms_free_sign_name,sex,location',
                        'sms_type':'norma',
                        'sms_free_sign_name':'亚洲掘金',
                        'rec_num': phone,
                        'sms_template_code': templates[2],
                        'sms_param': {
                            "number": sms_code,
                            "product": "亚洲掘金"
                        }
                    },
                    function (error, sms_response) {
                        if(error) {
                            console.info('发送验证码失败。 ' + error);
                            res.json({ret:4,msg:"获取太频繁，请稍候。"})
                        } else {
                            console.info("验证码发送成功");
                            console.info(sms_response);
                            pool.getConnection(function(err,connection){
                                if (err) {
                                    connection.release();
                                    return;
                                }
                                console.log('当前线程Id ' + connection.threadId);
                                connection.query('call save_phone_msg("'+phone+'","'+sms_code+'")',function(err,rows){
                                    connection.release();
                                    if(err) {
                                        console.info(err);
                                    }else{
                                        console.info("验证码保存到数据库。。。。。。。。。。"+JSON.stringify(rows));
                                    }
                                });
                                connection.on('error', function(err) {
                                    console.info(err);
                                });
                            });
                            res.json({ret:0})
                        }
                    }
                );
            }else{
                res.json({ret:1,msg:"该号码未注册"})
            }
        });
    }else{
        res.json({"ret":1,"msg":"手机号格式不正确。"})
    }
};
// 保存用户修改的密码
module.exports.save_update_customer_pwd=function(req,res){
    var phone =req.params.phone;
    var password=req.params.password;
    var code=req.params.code;
    if(phone&&password&&code){
        if(password.length>100){
            res.json({ret:1,msg:"密码太长，长度小于100位"});
            return;
        }
        if(code.length>50){
            res.json({ret:1,msg:"验证码格式不正确"});
            return;
        }
        if(check_phone(phone)){
            pool.getConnection(function(err,connection){
                if (err) {
                    connection.release();
                    res.json({ret:2,msg:"服务异常"})
                    //res.json({"code" : 100, "status" : "Error in connection database"});
                    return;
                }
                console.log('当前线程Id ' + connection.threadId);
                connection.query('call update_customer_pwd("'+phone+'","'+password+'","'+code+'")',function(err,rows){
                    connection.release();
                    if(err) {
                        console.info(err)
                        res.json({ret:1})
                    }else{
                        var msg_code=rows[0][0]._result;
                        switch(msg_code){
                            case 0:
                                res.json({ret:0});
                                break;
                            case 1:
                                res.json({ret:msg_code,msg:"手机号码已存在"});
                                break;
                            case 2:
                                res.json({ret:msg_code,msg:"验证码不正确"});
                                break;
                            case 3:
                                res.json({ret:msg_code,msg:"验证码已过期"});
                                break;
                            case 4:
                                res.json({ret:msg_code,msg:"验证码不存在"});
                                break;
                            default:
                                res.json({ret:8,msg:"网络异常，请稍候重试"});
                        }
                    }
                });
                connection.on('error', function(err) {
                    console.info(err)
                    res.json({ret:1});
                    return;
                });
            });
        }

    }else{
        res.json({ret:1,msg:"参数不全，请检查参数"})
    }
};

//后台登录
module.exports.back_login= function (req,res) {
    var name=req.params.username;
    var pwd=req.params.password;
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
                        //res.cookie('name', rows[0].user_name);
                        res.json({ret:0,username:rows[0].user_name})
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
module.exports.user_list_json=function(req,res){
    var pageIndex=req.query.page||1;
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
                console.info("数据库连接异常")
                res.json({total:0,rows:[]})
                return;
            }
            connection.query("select id,phone,create_time from customer order by create_time desc  limit "+pageIndex+","+row+"  ",function(err,rows){
                connection.release();
                if(!err) {
                    res.json({total:total,rows:rows});
                }
            });
            connection.on('error', function(err) {
                console.info("数据库连接异常")
                res.json({total:0,rows:[]})
                return;
            });
        });
    })



};
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