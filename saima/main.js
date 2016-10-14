var express= require("express");
var mysql = require('mysql');
var router=require("./controller/router.js");
var app = express();
var http=require('http').Server(app);
var io=require('socket.io')(http);
var cookieParser = require('cookie-parser');
app.set("view engine","ejs");
//路由中间件
app.use(express.static("./public"));
app.use(cookieParser());
app.get("/",router.login);

app.get("/manage",router.manage);
app.get("/check/login",router.check_login);
app.get("/user/list",router.user_list_page);
app.get("/user/list/json",router.user_list_json);
app.get("/delete/user/:id",router.delete_user);
app.get("/video",router.video_paly);
app.get("/login",router.login);

app.get("/save/user/info/:name/:pwd",router.save_users);
app.get("/save/user/login/status",router.save_user_login_status);

app.get("/dj/user/:name/:pwd",router.dj_user);
app.get("/ok/user/:name/:pwd",router.ok_user);
app.get("/stop/user/:name/:pwd",router.stop_user);
//冻结用户
app.get("/frozen/user/:id",router.frozen_user);
//解冻用户
app.get("/unfrozen/user/:id",router.unfrozen_user);

app.get("/close/page",router.close_page);


var pool = mysql.createPool({
    host: '101.200.113.40',
    user: 'yunshi',
    password: 'zFpVu4JmPZSIfbLa',
    database: 'saima',
    port: 3306
});
//---------socket.io 实战
io.on('connection',function(socket){
    socket.emit('open');  //通知客户端已连接

    socket.emit('back');//后台已经链接上了
    //在线用户
    var onlineUsers = [];
    //当前在线人数
    var onlineCount = 0;

    //网页根据user_id修改数据库的该id 的值修改状态为2
    socket.on('user_info',function(user_info){
        //根据客户端传递过来的user_id 获取评论信息
        if(user_info.name==='manage'){
            socket.emit("status","ok");
        }else{
            if(user_info.user_id){
                pool.getConnection(function(err,connection){
                    if (err) {
                        connection.release();
                        console.info("数据库连接异常")
                        socket.emit("status","error");
                        return;
                    }
                    connection.query("update customer set status=2 where id='"+user_info.user_id+"' ",function(err,rows){
                        connection.release();
                        if(!err) {
                            socket.name = user_info.user_id;
                            socket.emit("status","ok");
                        }
                    });
                    connection.on('error', function(err) {
                        console.info("数据库连接异常")
                        socket.emit("status","error");
                        return;
                    });
                });
            }else{
                console.info("前台链接")
                socket.emit("status","error");
            }
        }


    });
    socket.on("count_users",function(user_name){
        if(user_name){
            onlineUsers.push(user_name);
            onlineCount++;
            socket.broadcast.emit("count_num",onlineCount);
            socket.broadcast.emit("user_list",onlineUsers.join(","));
            socket.broadcast.emit("update_list","stop");
        }
    });


    //用户关闭页面时候
    socket.on('disconnect',function(){
        console.info(socket.name+" 用户关闭了页面。。。。。。。。。。。。。。。。。。。。。。")
        if(socket.name){
            //根据客户端传递过来的user_id 获取评论信息
            pool.getConnection(function(err,connection){
                if (err) {
                    connection.release();
                    console.info("数据库连接异常")
                    socket.emit("status","error");
                    return;
                }
                connection.query("update customer set status=1 where id='"+socket.name+"' ",function(err,rows){
                    connection.release();
                    if(!err) {
                        onlineUsers.remove(socket.name);
                        onlineCount--;
                        if(onlineCount<0){
                            onlineCount=0;
                        }
                        socket.broadcast.emit("count_num",onlineCount);
                        socket.broadcast.emit("user_list",onlineUsers.join(","));
                        socket.broadcast.emit("update_list","stop");
                    }
                });
                connection.on('error', function(err) {
                    console.info("数据库连接异常");
                    socket.emit("status","error");
                    return;
                });
            });
        }
    });

    //后台管理员停止用户时候
    socket.on('stop_user',function(user_id){
        //根据客户端传递过来的user_id 获取评论信息
        console.info("冻结用户。。。。。。。。。。。。。。"+user_id);
        socket.broadcast.emit("user_id_"+user_id,"stop");
        socket.emit("update_list","stop");
        pool.getConnection(function(err,connection){
            if (err) {
                connection.release();
                console.info("数据库连接异常")
                socket.emit("status","error");
                return;
            }
            connection.query("update customer set status=1 ,type=2 where id='"+user_id+"' ",function(err,rows){
                connection.release();
                if(!err) {
                    onlineCount--;
                    if(onlineCount<0){
                        onlineCount=0;
                    }
                    socket.broadcast.emit("count_num",onlineCount);
                    getUserNameById(user_id,function(err,user_name){
                        if(!err){
                            onlineUsers.remove(user_name);
                            socket.broadcast.emit("user_list",onlineUsers.join(","));
                        }
                    })
                }
            });
            connection.on('error', function(err) {
                console.info("数据库连接异常")
                socket.emit("status","error");
                return;
            });
        });

    });

});
//根据用户名称获取id
function getUserNameById(user_id,callback){
    pool.getConnection(function(err,connection){
        if (err) {
            connection.release();
            callback(err);
        }
        connection.query("select name from customer where id='"+user_id+"' ",function(err,rows){
            connection.release();
            if(!err) {
               callback(null,rows[0].name)
            }
        });
        connection.on('error', function(err) {
            console.info("数据库连接异常")
            callback(err);
        });
    });
}
Array.prototype.remove = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};








app.use(function(req,res){
    res.render("err")
});
http.listen(8888,function(){
    console.log("listening on * 8888")
});
