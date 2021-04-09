const dotenv = require('dotenv');
dotenv.config();
const infrastructure = require('./infrastructure.js');
const utils = require('./utils.js');
const packageFile = require('./package.json');
const httpClient = require('./httpClient')
const configurator = require('./configurator')


const init = async function (governifyConfiguration = { }) {
    console.log('Starting Governify-Commons...')
    try {
        if (governifyConfiguration.configurations){
            await Promise.all(governifyConfiguration.configurations.map(function (config) {
                console.log('Loading configuration: ', config.name);
                return configurator.loadConfig(config.name, config.location, config.default);
            }))
        }
        await infrastructure.loadServices();
    } catch (err) {
        console.error('Error loading Governify-Commons: ', err)
    }

    console.log('Governify module loaded correctly. Version: ', packageFile.version);
}

module.exports.infrastructure = infrastructure;
module.exports.utils = utils;
module.exports.httpClient = httpClient;
module.exports.configurator = configurator;
module.exports.init = init;
