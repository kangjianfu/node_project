/**
 * 操作客户
 */
var router = require('express').Router();
var log = require("../lib/log").logger("customer");
var utils = require("../lib/utils");
var Customer = require("../model/customer");
var error_msg=require('../config/error.json');
/* GET users listing. */
router.get('/', function(req, res) {
    res.json({ret:1});
});
router.get('/:action', function(req, res) {
        switch (req.params.action) {
          case "list":
            list(req, res);
            break;
          case "deletebyId":
            delete(req, res);
            break;
          default:
            res.josn({ret:1,msg:error_msg['RESULT_NOT_API']})
        }
});
/**
 * 展示用户列表
 * @param req
 * @param res
 */
function list(req,res){
    var pageIndex=req.query.page||1;
    pageIndex-=1;
    var row=req.query.rows||10;
    if(pageIndex>1){
      pageIndex=pageIndex*row
    }
    var sql_list="select id,phone,email,name,create_time from customer order by create_time desc limit ?,? ";
    var sql_count="select count(*) as count from customer ";
    Customer.list(sql_list,[pageIndex,row],function(result){
        if(result){
          Customer.getCount(sql_count,function(obj){
            if(obj){
              res.json({ret:0,total:obj[0].count,rows:result});
            }else{
              res.json({ret:1,msg:obj});
            }
          })
        }else{
          res.json({ret:1,msg:error_msg['SERVER_DB_ERROR']});
        }
    })
}



function deletebyId(req,res){

}


module.exports = router;
