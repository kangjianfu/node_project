/**
 * Created by lv-juan on 2016/6/28.
 */
var file =require("../models/file.js")
exports.showIndex=function(req,res){
    //res.render("index",{
    //    "albums":file.getAllAlbums()
    //})
    file.getAllAlbums(function(err,allAlbaums){
        if(err){
            res.send(err)
            return
        }
        res.render("index",{"albums":allAlbaums});
    })
}

exports.showAlbum= function (req,res) {
    res.send("相册"+req.params.albumName)
}