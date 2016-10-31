var express= require("express");
var router=require("./controller/router.js");
var login=require("./controller/login.js");
var msg=require("./controller/msg.js");
var bodyParser=require("body-parser");
var app = express();
var cookieParser = require('cookie-parser');
//设置跨域访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1');
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
//路由中间件
app.use(express.static("./public"));
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

app.listen(8555);
