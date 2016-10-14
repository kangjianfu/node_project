var hostUrl=location.host;
var socket= io(hostUrl);
var u_id="";
var url_parm=location.search;
if(url_parm){
    u_id=url_parm.substring(url_parm.indexOf("=")+1);
}
socket.on('open',function(){
    var user_id=$.cookie('user_id');
    var  user_name=$.cookie('name');
    if(!user_id){
        window.location.href='/login'
        console.info("用户id 不存在")
    }else{
        socket.emit('user_info',{user_id:user_id,name:user_name});
    }
    if(user_name!="manage"){
        socket.emit("count_users",user_name);
    }
    console.info('已连接至服务器');
});

socket.on('status',function(msg){
    if(msg==="error"){
        window.location.href='/login'
    }
});

socket.on("user_id_"+u_id,function(msg){
    window.location.href='/login'
});

//socket.on('comments',function(items){
//    $("#comments_container").empty();
//    if(items.length>0){
//        for(var i=0;i<items.length;i++){
//            var ts = new Date(parseInt(items[i].comment_id));
//            var time=formatDate(ts);
//            $("#comments_container").append("<div class=\"media\" ><div class=\"media-left\"><a href=\"#\">" +
//                "<img  width=\"34px\" height=\"34px\"  style=\"border-radius: 50%\" src='"+items[i].avata+"' /></a></div>" +
//                "<div class=\"media-body\" ><p>"+items[i].nick_name+" <span style='float:right'>"+time+"</span></p><p>"+items[i].msg+"</p></div></div>");
//            $("#comments_container").append("<hr>")
//        }
//    }else{
//        $("#comments_container").append("<div id='zanwu_pl'>暂无评论<div>")
//    }
//});
//监听服务端的chat message事件，接受每一条消息
//socket.on('comment_msg_'+share_id,function(text){
//    $("#zanwu_pl").remove();
//    $("#comments_container").prepend("<div class=\"media\"><div class=\"media-left\"><a href=\"#\">" +
//        "<img  width=\"34px\" height=\"34px\" style=\"border-radius: 50%\" src='"+text.avata+"' /></a></div><div class=\"media-body\" ><p>"+text.nick_name+" <span style='float:right'>"+getNowStr()+"</span></p><p>"+text.msg+"</p></div></div><hr>");
//
//});


//
//function sendComments(obj){
//    var msg=$("#comment_iputs").val();
//    var tem=msg.replace(/\s+/g,"");
//    if(duration>0){
//        var type=2;
//    }
//    var msg_obj={ type:type,share_id:share_id,avata:pl_avata,nick_name:nick_name,sender_id:sender_id,origin:2,dist_id:zbk_id,msg:tem,service_code:service_code};
//    socket.emit('comment_msg',msg_obj);
//    $("#comment_iputs").val("");
//}

function getNowStr() {
    var date=new Date();
    //date=new Date(ts+8*60*60*1000);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var month = (date.getMonth()+1);
    month = month< 10 ? '0'+month: month;
    var day = date.getDate();
    day = day< 10 ? '0'+day: day;
    var strTime = (hours<10?'0'+hours:hours) + ':' + minutes;
    return date.getFullYear() + "-" + month + "-" + day + " " + strTime;
}