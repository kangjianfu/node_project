var hostUrl=location.host;
var socket= io(hostUrl);
var u_id="";
var url_parm=location.search;
if(url_parm){
    u_id=url_parm.substring(url_parm.indexOf("=")+1);
}
socket.on('back',function(){
    console.info('后台已将连接上了');
});

socket.on('user_list',function(list){
    $("#onlineUserIds").text(list)
})
socket.on('count_num',function(num){
    $("#onlineCount").text(num)
});
socket.on('count_num',function(num){
    $("#onlineCount").text(num)
});

socket.on('update_list',function(msg){
    $("#itemList").datagrid('reload');
    $("#itemList").datagrid("unselectAll")
});
function stop_andFrozen_user(id){
    socket.emit('stop_user',id);
}

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