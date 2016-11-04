/**
 * 操作用户信息
 */

var crypto = require("crypto");
var sqlClient = require("../lib/db").init();
var log = require("../lib/log").logger("customer");
var utils = require("../lib/utils");

var Customer = module.exports = function(options) {
    var that = this;
    utils.extend(that, {
        "name": "",
        "password": "",
        "email": "",
        "logo": "",
        "phone":"",
        "create_time": "",
        "update_time": utils.dateformat(new Date(), "yyyy-MM-dd hh:mm:ss")
    }, options);
}

/**
 * 新建一个用户
 */
Customer.prototype.save = function(callback) {
    callback = callback || utils.noop;
    var that = this;
    var args = {
        "name": that.name,
        "password": crypto.createHash("md5").update(that.password).digest("hex"),
        "email": that.email,
        "logo": that.logo,
        "phone":that.phone,
        "create_time": utils.dateformat(new Date(), "yyyy-MM-dd hh:mm:ss"),
        "update_time": that.update_time
    };
    sqlClient.insert("INSERT customer user SET ?", args, function(err, result) {
        if (err) {
            log.error("create customer:" + args.name + " failed.", err);
            callback(-1);
            return;
        }
        callback({
            "name": args.name,
            "email": args.email,
            "logo": args.logo,
            "insertId": result.insertId
        });
    })
};

/**
 * 根据条件检索用户
 * @param column {Array}  返回的字段，默认返回name, email, logo
 * @param condition {Object} 条件
 * @param callback {Function}
 */
Customer.get = function(column, condition, callback) {
    callback = callback || utils.noop();

    if (utils.type(column) !== "array" || column.length === 0) {
        column = ["name", "email", "logo","phone"];
    }
    condition = condition || {};
    if (!!condition.password) {
        condition.password = crypto.createHash("md5").update(condition.password).digest("hex");
    }
    var sql = "SELECT ?? FROM customer";
    var hasWhere = false;
    for (var key in condition) {
        if (!hasWhere) {
            sql += " WHERE";
            hasWhere = true;
        }
        sql += " " + key + "=" + sqlClient.escape(condition[key]) + " and";
    }
    if (hasWhere) {
        sql = sql.substr(0, sql.length - " and".length);
    }

    sqlClient.select(sql, [column], function(err, result) {
        if (err) {
            log.error("select user failed.", err);
            callback([]);
            return;
        }
        callback(result);
    });
}

/**
 * 根据用户名来检索用户
 * @param name {String}
 * @param callback {Function}
 */
Customer.getByName = function(name, callback) {
    name = name || "";
    Customer.get([], {"name": name}, callback);
}

/**
 * 根据sql 语句获取数量
 *
 * @param sql sql
 * @param condition 条件
 * @param callback 回调
 */
Customer.getCount=function(sql,callback){
    sqlClient.select(sql, function(err, result) {
        if (err) {
            log.error("select customer failed.", err);
            callback(null);
            return;
        }
        callback(result);
    });
};
/**
 *
 * @param sql sql
 * @param condition 条件
 * @param callback 回调
 */
Customer.list=function(sql,condition,callback){
    sqlClient.select(sql,condition,function(err, result) {
        if (err) {
            log.error("select customer failed.", err);
            callback(null);
            return;
        }
        callback(result);
    });
}




