const chalk = require('chalk');
const governify = require('../index');


function Logger(tags = []) {
    this.tags = tags || [];
}

const cloneInstance = (logger) =>{
    return new Logger([...logger.tags]); //Clone the array to let the original unmodified
}


Logger.prototype.addPermanentTags = function(tags){
    if (!(tags instanceof Array)){
        this.tags.push(tags);
    } else {
        this.tags = this.tags.concat(tags);
    }
}

Logger.prototype.debug = function(...msg){
    if (LogLevel.DEBUG < logConfig.level){
        return;
    }
    console.debug(this.getMessageFormatted(LogType.DEBUG, ...msg))
}

Logger.prototype.info = function(...msg) {
    if (LogLevel.INFO < logConfig.level){
        return;
    }
    console.info(this.getMessageFormatted(LogType.INFO, ...msg))
}

Logger.prototype.error = function(...msg) {
    if (LogLevel.ERROR < logConfig.level){
        return;
    }
    console.error(this.getMessageFormatted(LogType.ERROR, ...msg))
}

Logger.prototype.warn = function(...msg) {
    if (LogLevel.WARN < logConfig.level){
        return;
    }
    console.warn(this.getMessageFormatted(LogType.WARN, ...msg))
}

Logger.prototype.fatal = function(...msg) {
    if (LogLevel.FATAL < logConfig.level){
        return;
    }
    console.error(this.getMessageFormatted(LogType.FATAL, ...msg))
}

Logger.prototype.tag = function(tags){
    let newLogger = cloneInstance(this);
    newLogger.addPermanentTags(tags);
    return newLogger;
}

Logger.prototype.getMessageFormatted = function(type, ...msg) {
    let finalMsg = "";

    if (logConfig.timestamp) {
        finalMsg += "[" + new Date().toISOString() + "] ";
    }
    if (logConfig.type) {
        finalMsg += coloredType(type);
    }
    if (logConfig.tracing) {
        finalMsg += coloredTraceId();
    }
    if (logConfig.tags && this.tags.length > 0){
        finalMsg += "[" + this.tags.join(",") + "] ";
    }
    finalMsg += msg.join(" ");
    return finalMsg;
}


const Theme = {
    TRACEID: chalk.hex("#606C38"),
    INFO: chalk.hex("#0077B6"),
    //DEBUG: chalk.hex("#B7B7A4"),
    DEBUG: chalk.rgb(220, 47, 2),
    
    ERROR: chalk.hex("#DC2F02"),
    WARN: chalk.hex("#F4A261"),
    FATAL: chalk.bgHex("#DC2F02"),
    DEFAULT: chalk.white()
}



function getLogConfig(){
    return logConfig;
}

function setLogConfig(newConfig){
    logConfig = newConfig;
}

const LogType = {
    INFO: "info",
    DEBUG: "debug",
    ERROR: "error",
    WARN: "warn",
    FATAL: "FATAL",
}
const LogLevel = {
    DEBUG: 1,
    INFO: 2,
    WARN: 3,
    ERROR: 4,
    FATAL: 5,
}

let logConfig = {
    type: true,
    tracing: true,
    timestamp: true,
    tags: true,
    level: LogLevel.DEBUG
}

function coloredTraceId() {
    return Theme.TRACEID("[" + governify.tracer.getCurrentTraceShortId() + "] ");
}

function coloredType(type) {
    switch (type) {
        case LogType.DEBUG:
            return Theme.DEBUG("[" + type + "] ")
        case LogType.INFO:
            return Theme.INFO("[" + type + " ] ")
        case LogType.ERROR:
            return Theme.ERROR("[" + type + "] ")
        case LogType.WARN:
            return Theme.WARN("[" + type + " ] ")
        case LogType.FATAL:
            return Theme.FATAL("[" + type + "] ")
        default:
            return Theme.DEFAULT("[" + type + "] ")
    }
}


module.exports = Logger;
module.exports.getLogConfig = getLogConfig;
module.exports.setLogConfig = setLogConfig;
