
const YAML = require('yaml');
const fs = require('fs');
const governify = require('./index');

module.exports = {
    loadObjectFromFileOrURL: loadObjectFromFileOrURL,
    unfoldObject: unfoldObject,
    getTextBetween: getTextBetween,
    requireFromString: requireFromString,
    requireFromFileOrURL: requireFromFileOrURL
}

async function requireFromFileOrURL(fileOrUrl, filename) {
    let src = await loadObjectFromFileOrURL(fileOrUrl);
    return requireFromString(src, filename);
}

async function requireFromString(src, filename) {
    var Module = module.constructor;
    var m = new Module();
    m._compile(src, filename);
    return m.exports;
}

//TODO: new methods to read only the content without parse as a object (for js and other files)
async function loadObjectFromFileOrURL(fileOrURL) {
    let objectResult;
    try {
        if (fileOrURL.startsWith('http://') || fileOrURL.startsWith('https://')) {
            //URL Type
            let requestFile = await governify.httpClient.get(fileOrURL);
            if (fileOrURL.endsWith('.yaml') || fileOrURL.endsWith('.yml')) {
                objectResult = YAML.parse(requestFile.data)
            } else {
                objectResult = requestFile.data;
            }

        } else {
            //File type
            let fileContent = await fs.readFileSync(fileOrURL, 'utf8')
            if (fileOrURL.endsWith('.yaml') || fileOrURL.endsWith('.yml')) {
                objectResult = YAML.parse(fileContent)
            } else {
                objectResult = fileContent;
            }
        }
        return objectResult;
    } catch (error) {
        throw Error('Error requesting file from: ' + fileOrURL + ' ERROR: ' + error)
    }

}

// function getPropertyFromString(object, property) {
//     let propertyResult = property.split('.').reduce(function (p, prop) { return p[prop] }, object);
//     return propertyResult.default ? propertyResult.default : propertyResult;
// }

// function setPropertyFromString(object, property) {
//     let propertyResult = property.split('.').reduce(function (p, prop) { return p[prop] }, object);
//     return propertyResult.default ? propertyResult.default : propertyResult;
// }


function getTextBetween(text, betweenStart, betweenEnd) {
    let init = text.indexOf(betweenStart);
    let end = text.indexOf(betweenEnd);
    if (init != -1 && end != -1 && init < end) {
        return text.substr(init + 1, fin - init - 1);
    } else {
        return null;
    }
}

//Unfold a object to only 1 level variables
function unfoldObject(object) {
    function flatten(obj) {
        var result = {},
            f,
            key,
            keyf;

        for (key in obj) {
            if (obj[key] instanceof Array) {
                obj[key].forEach(function (k) {
                    f = flatten(k);
                    for (keyf in f) {
                        result[key + '.' + keyf] = f[keyf];
                    }
                    output.push(JSON.parse(JSON.stringify(result))); //poor man's clone object
                });
            } else if (obj[key] instanceof Object) {
                f = flatten(obj[key]);
                for (keyf in f) {
                    result[key + '_' + keyf] = f[keyf];
                }
            } else {
                result[key] = obj[key];
            }
        }
        return result;
    } //flatten
    var output = [];
    return flatten(input);;
} //unfold