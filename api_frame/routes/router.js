/**
 * 路由入口，在此进行各种路由配置
 */

var customer=require("./customer")
module.exports = function(app) {
    app.use("/customer", customer);

    /**
     * 没有匹配的路由，抛出404错误
     */
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
}