var fs =require("fs")
exports.getAllAlbums=function(callback){
    fs.readdir("./uploads",function(err,files){
        var allAlbums = [];
        if(err){
            callback("没有找到该文件夹",null)
            return;
        }
        (function iterator(k){
            if(k==files.length){
                callback(null,allAlbums)
                return;
            };
            fs.stat("./uploads/"+files[k],function(err,stats){
                if(stats.isDirectory()){
                    allAlbums.push(files[k])
                }
                iterator(k+1);
            });

        })(0);
    })
}