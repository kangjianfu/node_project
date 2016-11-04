var path = require("path");
var log4js = require("log4js");
/**
 * ��־����
 */
exports.configure = function() {
    log4js.configure(path.join(__dirname, "log4js.json"));
}

/**
 * ��¶��Ӧ�õ���־�ӿڣ����ø÷���ǰ����ȷ���Ѿ�configure��
 * @param name ָ��log4js�����ļ��е�category�������ҵ���Ӧ��appender��
 *              ���appenderû��д��category����ΪĬ�ϵ�category�������ж��
 * @returns {Logger}
 */
exports.logger = function(name) {
    var dateFileLog = log4js.getLogger(name);
    dateFileLog.setLevel(log4js.levels.INFO);
    return dateFileLog;
}

/**
 * ����express�м�������ø÷���ǰ����ȷ���Ѿ�configure��
 * @returns {Function|*}
 */
exports.useLog = function() {
    return log4js.connectLogger(log4js.getLogger("app"), {level: log4js.levels.INFO});
}