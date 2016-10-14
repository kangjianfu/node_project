
var service_code="ALVEBNQD";//服务码
var api_key="4142d0f7";//服务码对应的签名密钥

 function query_task_list() {
     var query_string = 'service_code='+service_code;
     $("#results").empty();
     call_api("task_list", query_string);
      //5秒刷新获取最新的
     setTimeout(query_task_list, 5000);
     setTimeout(update_user_status, 6000);

}

function update_user_status(){
    $.getJSON("/save/user/login/status",{},function(data){
        if(data.ret==1){
            window.location.href="/manage"
        }
    })
}



function make_signature(uri, query_string, now, api_key) {
            var data = uri + query_string + now;
            return CryptoJS.HmacSHA256(data, api_key);
}

function call_api(api, param_str) {
    var uri = '/api/20140928/' + api;
    var now = new Date().getTime();
    var signature = make_signature(uri, param_str, now, api_key);
   // uri = 'http://c.zhiboyun.com' + uri;
   uri='http://52.78.115.124/manager/info/task_list' 
    $.ajax({
            type: "GET",
            url: uri,
             dataType: "jsonp",
             crossDomain: true,
             success: function(json){
                    if(json.list.length>0){
                        for(var i =0;i<json.list.length;i++){
                            var task=json.list[i];
                            var url_live_url=json.list[i].http_live_url;
                            var user_name=json.list[i].inputs[0].user_name;
                            for(var j =0;j<json.list[i].outputs.length;j++){
                                var format=json.list[i].outputs[j].format;
								if(format.indexOf("rtmp")>=0){
                                    video_width=json.list[i].outputs[j].width
                                    video_height=json.list[i].outputs[j].height
									//$("#results").append("<tr><td>"+ "user_name:" + user_name +"</td></tr>");
                                    $("#results").append("<tr><td class='col-lg-3'>"+user_name+"</td><td class='col-lg-3'>"+ format +"</td><td class='col-lg-2'>"+ video_width +"</td><td class='col-lg-2'>"+ video_height +"</td><td class='col-lg-2'><input type='button' data='rtmp://52.78.115.124/live/"+json.list[i].task_id+"' class='btn bg-primary' onclick='init_player(this)' value='PLAY'></input></td></tr>");
								}
								if(format.indexOf("flv")>=0){
                                    video_width=json.list[i].outputs[j].width
                                    video_height=json.list[i].outputs[j].height
									//$("#results").append("<tr><td>"+ "user_name:" + user_name +"</td></tr>");
                                    $("#results").append("<tr><td class='col-lg-3'>"+user_name+"</td><td class='col-lg-3'>"+ format +"</td><td class='col-lg-2'>"+ video_width +"</td><td class='col-lg-2'>"+ video_height +"</td><td class='col-lg-2'><input type='button' data='http://52.78.115.124/live/id/"+json.list[i].task_id+".flv' class='btn bg-primary' onclick='init_player(this)' value='PLAY'></input></td></tr>");
								}
                               
                            }

                        }
                    }else{
                        
                       $("#results").empty();
                        $("#video_container").empty();
                        $("#video_container").append("<h1 class=\"display-3\">Hello, welcome! </h1><p class=\"lead\">no videos</p>")
                       
                    }

                },
                error: function(err, exception) { 
                    alert('error: ' + JSON.stringify(err));
                }
      });
}





//播放器的参数
var parameters = {
    src : "",
    autoPlay : "true",
    verbose : true,
    controlBarAutoHide : "true",
    controlBarPosition : "bottom",
    poster : "bootstrap4.0/images/poster.png",
    plugin_hls :"bootstrap4.0/js/swf/wmp_plugin_hls.swf"
}

function init_player(obj) {
    $("#video_container").empty(); 
    if(video_height>800){
     $("#video_container").parent().css({"padding":"0px"})                       
    }
    $("#video_container").css({"text-align":"center"})
    $("#video_container").append("<div  id=\"video\"></div>");
     parameters.src=$(obj).attr("data");                  
//init_player(json.task_list[i].outputs[j].width,json.task_list[i].outputs[j].height)
    swfobject.embedSWF("bootstrap4.0/js/swf/woan_wmp.swf", "video", video_width,
        video_height, "10.1.0","bootstrap4.0/js/swf/expressInstall.swf",
        parameters, {
        allowFullScreen : "true",
        wmode : "opaque"
        }, {
            name : "Woan_Player"
        });
}

