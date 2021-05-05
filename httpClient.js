const axios = require('axios');
const governify = require('./index');
const fs = require('fs');

let requestLoggingEnabled = (process.env['GOV_LOG_REQUESTS'] ? process.env['GOV_LOG_REQUESTS'] === 'true' : true);

const serviceName = JSON.parse(fs.readFileSync('./package.json')).name;

function appendCommonsLog(logTag, method, URL, responseStatus) {
    if (requestLoggingEnabled && governify.isReady()) {
        axios.patch(governify.infrastructure.getServiceURL('internal.assets') + '/api/v1/public/logs/commons.log',
            { operation: 'append', content: '[' + logTag + '] ' + serviceName + ' => ' + '[' + method + ']' + ' => ' + URL  + ' => ' + responseStatus + '\n' }
        ).catch(); // Do not log catch to avoid logging in case assets is not deployed
    }
}


module.exports = async function (config) {
    return axios(config).then(response => {
        appendCommonsLog('HTTPRequest OK', config.method, config.url, response.status);
        return response;
    }).catch(err => {
        let status = (err && err.response) ? err.response.status : 'No error response';
        appendCommonsLog('HTTPRequest FAIL', config.method, config.url, status);
        console.error('Failed when calling service from Governify with config:', config)
        throw err;
    });
}

module.exports.request = async function request(config) {
    return axios.request(config).then(response => {
        appendCommonsLog('HTTPRequest OK', config.method, config.url, response.status);
        return response;
    }).catch(err => {
        let status = (err && err.response) ? err.response.status : 'No error response';
        appendCommonsLog('HTTPRequest FAIL', config.method, config.url, status);
        console.error('Failed when calling service from Governify with config:', config)
        throw err;
    });
}

module.exports.get = async function get(url, config = {}) {
    return axios.get(url, config).then(response => {
        appendCommonsLog('HTTPRequest OK', 'GET', url, response.status);
        return response;
    }).catch(err => {
        let status = (err && err.response) ? err.response.status : 'No error response';
        appendCommonsLog('HTTPRequest FAIL', 'GET', url, status);
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
    });
}

module.exports.delete = async function deleteF(url, config = {}) {
    return axios.deleteF(url, config).then(response => {
        appendCommonsLog('HTTPRequest OK', 'DELETE', url, response.status);
        return response;
    }).catch(err => {
        let status = (err && err.response) ? err.response.status : 'No error response';
        appendCommonsLog('HTTPRequest FAIL', 'DELETE', url, status);
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
    });
}

module.exports.head = async function head(url, config = {}) {
    return axios.head(url, config).then(response => {
        appendCommonsLog('HTTPRequest OK', 'HEAD', url, response.status);
        return response;
    }).catch(err => {
        let status = (err && err.response) ? err.response.status : 'No error response';
        appendCommonsLog('HTTPRequest FAIL', 'HEAD', url, status);
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
    });
}

module.exports.options = async function options(url, config = {}) {
    return axios.options(url, config).then(response => {
        appendCommonsLog('HTTPRequest OK', 'OPTIONS', url, response.status);
        return response;
    }).catch(err => {
        let status = (err && err.response) ? err.response.status : 'No error response';
        appendCommonsLog('HTTPRequest FAIL', 'OPTIONS', url, status);
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
    });
}

module.exports.post = async function post(url, data = {}, config = {}) {
    return axios.post(url, data, config).then(response => {
        appendCommonsLog('HTTPRequest OK', 'POST', url, response.status);
        return response;
    }).catch(err => {
        let status = (err && err.response) ? err.response.status : 'No error response';
        appendCommonsLog('HTTPRequest FAIL', 'POST', url, status);
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
    });
}

module.exports.put = async function put(url, data = {}, config = {}) {
    return axios.put(url, data, config).then(response => {
        appendCommonsLog('HTTPRequest OK', 'PUT', url, response.status);
        return response;
    }).catch(err => {
        let status = (err && err.response) ? err.response.status : 'No error response';
        appendCommonsLog('HTTPRequest FAIL', 'PUT', url, status);
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
    });
}

module.exports.patch = async function patch(url, data = {}, config = {}) {
    return axios.patch(url, data, config).then(response => {
        appendCommonsLog('HTTPRequest OK', 'PATCH', url, response.status);
        return response;
    }).catch(err => {
        let status = (err && err.response) ? err.response.status : 'No error response';
        appendCommonsLog('HTTPRequest FAIL', 'PATCH', url, status);
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
    });
}

module.exports.getRequestLogging = () => {return requestLoggingEnabled};
module.exports.setRequestLogging = (value) => {requestLoggingEnabled = value};
