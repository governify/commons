const axios = require('axios');
const governify = require('./index');

module.exports.request = async function request(config) {
    return axios.request(config)
}

module.exports.get = async function get(url, config = {}) {
    return axios.get(url, config)
}

module.exports.delete = async function deleteF(url, config = {}) {
    return axios.deleteF(url, config)
}

module.exports.head = async function head(url, config = {}) {
    return axios.head(url, config)
}

module.exports.options = async function options(url, config = {}) {
    return axios.options(url, config)
}

module.exports.post = async function post(url, data = {}, config = {}) {
    return axios.post(url, data, config)
}

module.exports.put = async function put(url, data = {}, config = {}) {
    return axios.put(url, data, config)
}

module.exports.patch = async function patch(url, data = {}, config = {}) {
    return axios.patch(url, data, config)
}
