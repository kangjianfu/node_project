var express= require("express");
var login=require("./controller/login.js");
var customer=require("./controller/customer.js");
var msg=require("./controller/msg.js");
var bodyParser=require("body-parser");
var cookieParser = require('cookie-parser');
// 引用日志模块
var log4js = require("./log");
var app = express();
//日志配置
log4js.configure();
app.use(log4js.useLog());
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
//解决post 请求收不到参数的问题
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//路由中间件
//app.use(express.static("./public"));
app.use(cookieParser());
app.get("/user/list/json",login.user_list_json);
app.get("/send/phone/sms/by/register/:phone",login.send_phone_msg_by_register);
app.get("/register/customer/account/:phone/:password/:code",login.register_customer_account);
//用户登录
app.get("/user/login/:phone/:password",login.user_login);
//修改密码发送验证码
app.get("/send/phone/sms/by/edit/pwd/:phone",login.send_phone_msg_by_update_pwd);
app.get("/save/update/cusotmer/pwd/:phone/:password/:code",login.save_update_customer_pwd);
app.get("/back/manage/:username/:password",login.back_login);
//根据用户id 获取用户信息
app.get("/get/customer/:id",customer.get_customer_info_by_id);
//后台登录
app.post('/back/sigin',login.back_sigin);
//后台修改用户信息
app.post('/back/edit/cutomer/info',customer.edit_customer_info);
//获取注册用户总数据
app.get('/get/all/customer/register/count',customer.get_all_register_count);
//根据用户id 删除用户信息
app.get('/delete/customer/by/:id',customer.delete_user_by_id);
//根据输入的日期。获取当前注册数量
app.get('/get/all/register/by/date/:time',customer.get_all_register_count_by_time);
app.listen(8555);
