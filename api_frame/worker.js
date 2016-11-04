/**
 * 工作进程
 */

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var log4js = require("./lib/log");
var environment = require("./lib/env").config();
var router = require('./routes/router');
var app = express();
log4js.configure("worker");
/* 中间件 */
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
app.use(cookieParser());

//解决post 请求收不到参数的问题
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* 路由 */
router(app);

/* 捕获中间件抛出的异常 */
app.use(function(err, req, res, next) {
    res.json({ret:999,status:err.status || 500,message:err.message})
});


/* 启动工作进程 */
app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get("port"), function() {
    var log = log4js.logger("worker");
    log.info("port " + app.get("port"));
    log.info("start worker, pid is " + process.pid);
});

/* 捕获全局异常，如果最终调入到了这里，要非常注意 */
process.on("uncaughtException", function(err) {
    var log = log4js.logger("worker_" + process.pid);
    log.error("Error caught in uncaughtException event:", err);
});


