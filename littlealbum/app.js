/**
 * Created by lv-juan on 2016/6/28.
 */
var express= require("express")
var app =express()
var router=require("./controller") //这样写是因为controller 中有package.json 文件并且 package.json 文件中有个main.js
//设置模版引擎
app.set("view engine","ejs")
//路由中间件
app.use(express.static("./public"))
app.get("/",router.showIndex)//此处的写法需要注意。后面不能带有参数。。。此处是个大坑
app.get("/:albumName",router.showAlbum)
app.listen(3000)