const dotenv = require('dotenv');
dotenv.config();
const infrastructure = require('./infrastructure.js');
const utils = require('./utils.js');
const packageFile = require('./package.json');
const httpClient = require('./httpClient');
const configurator = require('./configurator');
const middleware = require('./middleware');

const maxRetries = 10;
const timeoutRetry = 3000;
let currentRetries = 0;


const init = async function (governifyConfiguration = {}) {
    if(currentRetries === 0) console.log('Starting Governify-Commons...')
    try {
        if (governifyConfiguration.configurations) {
            await Promise.all(governifyConfiguration.configurations.map(function (config) {
                console.log('Loading configuration: ', config.name);
                return configurator.loadConfig(config.name, config.location, config.default);
            }))
        }
        await infrastructure.loadServices();
        console.log('Governify module loaded correctly. Version: ', packageFile.version);
        return middleware.mainMiddleware;
    } catch (err) {
        if (currentRetries < maxRetries) {
            currentRetries++;
            console.log('Error loading Governify-Commons:', err.message, '- Retrying in', timeoutRetry, 'ms - (', currentRetries, '/', maxRetries, ')');
            await utils.sleepPromise(timeoutRetry);
            return await init(governifyConfiguration);
        }
        return Promise.reject(new Error('Maximum retries for Commons Init reached. Cannot load Governify Commons.'))
    }
}


module.exports.infrastructure = infrastructure;
module.exports.utils = utils;
module.exports.httpClient = httpClient;
module.exports.configurator = configurator;
module.exports.init = init;
