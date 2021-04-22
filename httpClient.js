const axios = require('axios');
const governify = require('./index');

module.exports = async function (config) {
    return axios(config).catch(err=>{
        console.error('Failed when calling service from Governify with config:', config)
        throw err;
     });
}

module.exports.request = async function request(config) {
    return axios.request(config).catch(err=>{
        console.error('Failed when calling service from Governify with config:', config)
        throw err;
     });
}

module.exports.get = async function get(url, config = {}) {
    return axios.get(url, config).catch(err=>{
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
     });
}

module.exports.delete = async function deleteF(url, config = {}) {
    return axios.deleteF(url, config).catch(err=>{
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
     });
}

module.exports.head = async function head(url, config = {}) {
    return axios.head(url, config).catch(err=>{
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
     });
}

module.exports.options = async function options(url, config = {}) {
    return axios.options(url, config).catch(err=>{
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
     });
}

module.exports.post = async function post(url, data = {}, config = {}) {
    return axios.post(url, data, config).catch(err=>{
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
     });
}

module.exports.put = async function put(url, data = {}, config = {}) {
    return axios.put(url, data, config).catch(err=>{
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
     });
}

module.exports.patch = async function patch(url, data = {}, config = {}) {
    return axios.patch(url, data, config).catch(err=>{
        console.error('Failed when calling service from Governify: ', url, ' with config:', config)
        throw err;
     });
}
