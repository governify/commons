const governify = require('../index');
const auth = require('basic-auth');
const { method } = require('lodash');
const logger = governify.getLogger().tag('commons-auth')
const yaml = require('js-yaml');
const fs = require('fs');

let credentials = {};


module.exports.loadCredentials = loadCredentials;
module.exports.authMiddleware = authMiddleware;

async function loadCredentials() {
    //Load credentials from endpoint of env var specified or from the file.
    let authLocation = "./auth.yaml";
    if (process.env['GOV_AUTH']) {
        authLocation = process.env['GOV_AUTH'];
        logger.info('Loading credentials from Environment Variable (GOV_AUTH) path: ', authLocation)
    }
    else {
        logger.info('Loading auth from default path:', authLocation)
    }
    try {
        credentials = await yaml.load(fs.readFileSync('./auth.yaml'));
        //Plain permissions processing rulesets and grouping solved in to the users.
        credentials.users.forEach(user => {
            user.plainPermissions = plainPermissions(undefined, user.permissions, credentials.rulesets)
        })
        logger.info('Successfully loaded auth file')
    } catch (err) {
        return Promise.reject(err)
    }
    return Promise.resolve(credentials)
}


async function authMiddleware(req, res, next) {
    let commonsConfig = governify.configurator.getConfig("commons")
    if (commonsConfig.auth) {
        var credentials = auth(req);
        if (!credentials || !checkValidLogin(credentials.name, credentials.pass)) {
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="Snapshot Management Login"');
            res.set('Connection', 'close');
            res.end('Unauthorized');
        } else {
            if (!checkValidPermissions(credentials.name, credentials.pass, req)) {
                res.statusCode = 403;
                res.end('Forbidden');
            }
            else {
                next();
            }
        }
    } else {
        next()
    }
}

function checkValidLogin(username, password) {
    if (username && password) {
        let loggedUser = credentials.users.find(user => {
            return (user.credentials.user === username && user.credentials.pass === password);
        })
        if (loggedUser) {
            return true;
        }
    }
    return false
}

function checkValidPermissions(username, password, request) {
    let loggedUser = credentials.users.find(user => {
        return (user.credentials.user === username && user.credentials.pass === password);
    })

    if (!loggedUser || !loggedUser.plainPermissions) {
        return false;
    }

    let allowRule;
    if (loggedUser.plainPermissions.allow) {
        allowRule = loggedUser.plainPermissions.allow?.some(allowPerm => {

            //Process allowed permissions to check allow true
            // allowPerm is a instance with url and method, just check request object matches both
            if (!allowPerm.url || !allowPerm.method){
                logger.error('Auth.yaml wrongly configured: Url and method should be specified in custom permission.');
                return false;
            }
            return (request.url.match(allowPerm.url) && request.method.match(allowPerm.method));
        })
    }

    let denyRule;
    if (loggedUser.plainPermissions.deny) {
        denyRule = loggedUser.plainPermissions.deny?.some(denyPerm => {
            //Process allowed permissions to check allow false
            return (request.url.match(denyPerm.url) && request.method.match(denyPerm.method));
        })
    }
    


    let allow = (denyRule || !allowRule) ? false : true

    return allow;

}

function plainPermissions(currentPermissions = { allow: [], deny: [] }, permissions, rulesets, iterations = 0) {
    let resultPermissions = currentPermissions;
    if (permissions.custom) {
        if (permissions.custom.allow) {
            resultPermissions.allow = resultPermissions.allow.concat(permissions.custom.allow);
        }
        if (permissions.custom.deny) {
            resultPermissions.deny = resultPermissions.deny.concat(permissions.custom.deny);
        }
    }



    if (permissions.rulesets) {
        if (iterations > 100) {
            logger.error('Auth.yaml wrongly configured: Permissions hierarchy max 100 depth reached.')
        } else {
            permissions.rulesets.forEach(setName => {
                let set = rulesets.find(rset => { return rset.name === setName });
                if (set) {
                    iterations++;
                    resultPermissions = plainPermissions(resultPermissions, set.permissions, rulesets, iterations);
                }
                else {
                    logger.error('Auth.yaml wrongly configured: Ruleset with name', setName, 'is not defined')
                }
            })

        }
    }
    return resultPermissions;
}