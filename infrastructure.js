
const governify = require('./index.js');
const mustache = require('mustache');
const _ = require('lodash');
const { replace } = require('lodash');
let infrastructure = {}

module.exports = {
    loadServices: loadServices,
    getService: getService,
    getServiceURL: getServiceURL,
    getServices: getServices,
    getServicesReplacedDefaults: getServicesReplacedDefaults
}

// ====================== EXPOSED FUNCTIONS ===================
//TODO: Implement api versioning also in the infrastructure managed by Governify-Commons
async function loadServices() {
    //Load infrastructure from endpoint of env var specified or from the file.
    let infrastructureLocation = "./infrastructure.yaml";
    if (process.env['GOV_INFRASTRUCTURE']) {
        infrastructureLocation = process.env['GOV_INFRASTRUCTURE'];
        console.log('Loading infrastructure from Environment Variable (GOV_INFRASTRUCTURE) path: ', infrastructureLocation)
    }
    else {
        console.log('Loading infrastructure from default path:', infrastructureLocation)
    }
    try {
        let newInfrastructure = await governify.utils.loadObjectFromFileOrURL(infrastructureLocation);
        replaceObjectDefaults(newInfrastructure);
        infrastructure = JSON.parse(mustache.render(JSON.stringify(newInfrastructure), newInfrastructure));
        console.log('Successfully loaded infrastructure file')
    } catch (err) {
        return Promise.reject(err)
    }
    return Promise.resolve(infrastructure)
}

function getService(service) {
    //Services are stored in process.env environment variables 
    try {
        return {

            request: function (config) {
                config.url = getServiceURL(service) + config.url;
                return governify.httpClient.request(config);
            },
            get: function (path, config = {}) {
                return governify.httpClient.get(getServiceURL(service) + path, config)
            },

            delete: function (path, config = {}) {
                return governify.httpClient.deleteF(getServiceURL(service) + path, config)
            },

            head: function (path, config = {}) {
                return governify.httpClient.head(getServiceURL(service) + path, config)
            },

            options: function (path, config = {}) {
                return governify.httpClient.options(getServiceURL(service) + path, config)
            },

            post: function (path, data = {}, config = {}) {
                return governify.httpClient.post(getServiceURL(service) + path, data, config)
            },

            put: function (path, data = {}, config = {}) {
                return governify.httpClient.put(getServiceURL(service) + path, data, config)
            },

            patch: function (path, data = {}, config = {}) {
                return axios.patch(getServiceURL(service) + path, data, config)
            }
         
        }



    } catch (err) {
        console.error('Failed loading service: ', service)
        return null;
    }
}

function getServiceURL(service) {
    try {
        let url = _.get(infrastructure, service);
        return typeof url === 'string' ? url : url.default; //Get default value if the url is a object
    } catch (err) {
        console.error('Failed loading serviceURL: ', service, ' ERROR:', err)
        return null;
    }
}


function getServices() {
    return infrastructure;
}

function getServicesReplacedDefaults(){
    let infrastructureClone = JSON.parse(JSON.stringify(infrastructure));
    replaceObjectDefaults(infrastructureClone);
    return infrastructureClone;
}



// ====================== END EXPOSED FUNCTIONS ===================


// ====================== HELPER FUNCTIONS ===================

//Helper function to replace default objects in infrastructure file (This function search for values in they object that matches with keys in the object to replace it)
function replaceObjectDefaults(object) {
    Object.entries(object).forEach(entry => {
        let key = entry[0];
        let value = entry[1];
        if (typeof value === 'string' && object[value]) {
            object[key] = object[value];
        }
        else if (typeof value === 'object') {
            replaceObjectDefaults(value)
        }
    })
}


// ====================== END HELPER FUNCTIONS ===================