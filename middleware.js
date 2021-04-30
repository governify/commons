const httpClient = require('./httpClient');
const infrastructure = require('./infrastructure');
const package = require('./package.json');
const fs = require('fs');
let servicePackage = JSON.parse(fs.readFileSync('./package.json'));

module.exports.mainMiddleware = async function mainMiddleware(req, res, next) {
    if (req.url === '/') {
        res.send({
            title: 'Governify Commons',
            version: package.version,
            requestLogging: httpClient.requestLoggingEnabled ? 'true' : 'false',
            serviceName: servicePackage.name,
            serviceVersion: servicePackage.version, 
        });
        return;
        }
    if (req.url.startsWith('/requestLogging')) {
            if (req.method === 'POST') {
                if (req.url === '/requestLogging/enable') {
                    httpClient.requestLoggingEnabled = true;
                    res.send('Enabled')
                    return;
                }
                if (req.url === '/requestLogging/disable') {
                    httpClient.requestLoggingEnabled = false;
                    res.send('Disabled')
                    return;
                }
                if (req.url === '/requestLogging/swap') {
                    httpClient.requestLoggingEnabled = !httpClient.requestLoggingEnabled;
                    res.send(httpClient.requestLoggingEnabled ? 'Enabled' : 'Disabled');
                    return;
                }
            }
            if (req.method === 'GET') {
                res.send(httpClient.requestLoggingEnabled ? 'Enabled' : 'Disabled');
                return;
            }
        }
        if (req.url.startsWith('/infrastructure/update')) {
            if (req.method === 'POST') {
                await infrastructure.loadServices().then(infrastructure => {
                    res.send('Updated infrastructure: ' + JSON.stringify(infrastructure))
                }).catch(err => {
                    console.error('Internal error reloading infrastructure');
                    res.send('Internal error reloading infrastructure, please reload this service: ' + err.message);
                });
                return;
            }
        }

        res.status(400).send('Method not implemented')
        return;

    }