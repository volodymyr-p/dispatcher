'use strict';
const jwt = require('jsonwebtoken');
const db = require('./database');
const express = require('express');
const bcrypt = require('bcryptjs');
const util = require('util');

//Connection to DB
const connection = db.con;

module.exports.getToken = function getToken(passhash, email, password) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, passhash, function (err, res) {
            if (res) {
                let token = jwt.sign({
                        username: email
                    },
                    global.gConfig.jsonwebtokenKey, {
                        expiresIn: '24h' // expires in 24 hours
                    }
                );
                resolve(token);
            } else
                reject("login and password does not match");
        });
    });
}

module.exports.checkToken = (d, onsuccess, onerror) => {


    checkTokenProm(d.req)
        .then(token => {
            return verifyJWTToken(token);
        }, (err) => {
            throw new Error(err)
        })
        .then(tokenrez => {
            return checkRoles(tokenrez, d.roles, tokenrez.username)
        }, (err) => {
            throw new Error(err)
        })
        .then(onsuccess, (err) => {
            if (onerror) {
                onerror(err)
            } else {
                d.res.json(err);
            }
        })
        .catch((error) => {
            if (onerror) {
                onerror(err)
            } else {
                d.res.json(err);
            }
        });
}


module.exports.getUser = (d, onsuccess, onerror) => {
    //remove later
    //onsuccess()
    //return;

    checkTokenProm(d.req)
        .then(token => {
            return verifyJWTToken(token);
        }, (err) => {
            throw new Error(err)
        })
        .then(tokenrez => {
            return getUser(tokenrez, d.roles, tokenrez.username)
        }, (err) => {
            throw new Error(err)
        })
        .then(onsuccess, (err) => {
            if (onerror) {
                onerror(err)
            } else {
                d.res.json(err);
            }
        })
        .catch((error) => {
            if (onerror) {
                onerror(err)
            } else {
                d.res.json(err);
            }
        });
}


const checkTokenProm = (req) => {
    return new Promise(function (resolve, reject) {
        let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
        if (token) {
            if (token.startsWith('Bearer ')) {
                // Remove Bearer from string
                token = token.slice(7, token.length);
            }
            resolve(token);
        } else {
            reject({
                success: false,
                message: 'Auth token is not supplied'
            });
        }
    });
};

function verifyJWTToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, global.gConfig.jsonwebtokenKey, (err, decodedToken) => {
            if (err || !decodedToken) {
                reject(err)
            }
            resolve(decodedToken)
        })
    })
}

function checkRoles(tokenrez, roles, username) {
    if (!tokenrez) {
        return {
            success: false,
            message: 'Token is not valid'
        };
    }

    if (!roles) {
        return {
            success: true,
            message: 'Token is valid'
        };
    }

    return new Promise((resolve, reject) => {
        db.con.query('SELECT user_role FROM users where login = ?;', [username], function (err, results) {
            if (err) throw err;
            if (roles.includes(results[0].user_role)) {
                resolve({
                    success: true,
                    message: 'Token is valid, role valid'
                });
            } else {
                reject({
                    success: false,
                    message: 'Bad role'
                });
            }

        });
    })

}

function getUser(tokenrez, roles, username) {
    return new Promise((resolve, reject) => {
        if (!tokenrez) {
            reject({
                success: false,
                message: 'Token is not valid'
            });
        } else
            db.con.query('SELECT user_role, id_organization FROM users where login = ?;', [username], function (err, results) {
                if (err) throw err;
                if (results.length == 0) {
                    reject({
                        success: false,
                        message: 'Your user was deleted?'
                    });
                } else
                    resolve({
                        name: username,
                        role: results[0].user_role,
                        id_organization: results[0].id_organization
                    });
            })
    })
}

//not on promices
module.exports.check = (d, onsuccess, onerror) => {
    if (!onerror) onerror = onErrorReturn;

    //get token
    let token = d.req.headers['x-access-token'] || d.req.headers['authorization'] ||
        d.req.cookies.authorization; // Express headers are auto converted to lowercase
    if (token) {
        if (token.startsWith('Bearer ')) {
            // Remove Bearer from string
            token = token.slice(7, token.length);
        }
    } else {
        onerror(d.res, 'Auth token is not supplied');
        return 'bad token';
    }

    //is token good?
    jwt.verify(token, global.gConfig.jsonwebtokenKey, (err, decodedToken) => {

        if (err || !decodedToken) {
            onerror(d.res, err);
            return;
        }

        if (!decodedToken) {
            onErrorReturn(res, 'Token is not valid');
            return;
        }

        //need return user
        connection.query(`SELECT * FROM users where login = '${decodedToken.username}'`, [], function (error, resUser) {
            if (error) {
                onerror(d.res, error);
                return;
            }

            //no need check roles
            if (!d.roles) {
                onsuccess(resUser[0]);
                return;
            }

            //need check roles
            let query = "SELECT user_role FROM users where login = ? ;";
            db.con.query(query, [decodedToken.username], function (err2, results) {
                if (err2) {
                    onerror(d.res, err2);
                    return;
                }
                if (results.length == 0) {
                    onerror(d.res, "No such user, was deleted?");
                    return;
                }
                if (d.roles.includes(results[0].user_role)) {
                    onsuccess(resUser[0]);
                    return;
                } else {
                    onerror(d.res, 'Bad role');
                    return;
                }

            });
        });
    })
}

function onErrorReturn(res, err) {
    res.status(400);
    res.send(err);
    return;
}

