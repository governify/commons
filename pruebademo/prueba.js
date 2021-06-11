const governify = require('../index');
const utils = require('../utils');
const http = require('http');
const express = require('express');
const assert = require('assert')
const app = express();
const serverPort = 9095;
const logger = governify.getLogger().tag("metrics");
let server;


governify.init({}).then(commonsMiddleware => {
    app.use(commonsMiddleware)
    app.use('/exampleMiddleware', simpleMiddleware)
    server = http.createServer(app)
    server.listen(9095, function () {
        console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
    });
}).catch(err => {
    console.error(err)
})


let simpleMiddleware = async function(req, res){
    logger.info("Info example");
    logger.warn("Warn example");
    logger.error("Error example");
    logger.fatal("Fatal example");
    logger.debug("Debug example");
    await utils.sleepPromise(4000);
    logger.info("AFTER - Info example");
    logger.warn("AFTER - Warn example");
    logger.error("AFTER - Error example");
    logger.fatal("AFTER - Fatal example");
    logger.debug("AFTER - Debug example");
    res.send("Received")
}