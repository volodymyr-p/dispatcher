'use strict';
const express = require('express');
const mysql = require('mysql');

const connection = mysql.createPool(global.gConfig.sqlConfig);

connection.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) {
        connection.release();
        console.log("Database is connected ... nn");
    }
    return
});

module.exports.checkUser = function checkUser(login) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM users WHERE login = ?', [login], function (error, results, fields) {
            if (error) {
                reject("sql error ocurred")
            } else {
                if (results.length > 0) {
                    resolve(results[0].password_hash);
                } else
                    reject("login does not exits");
            }
        });
    });
}

function returnall(request_str, onresult) {
    connection.query(request_str, (err, result) => {
        onresult(err, result)
    })
}
module.exports.returnall = returnall;

module.exports.dojob = function dojob(request_str, res) {
    returnall(request_str,
        function (err, rez) {
            res.setHeader('Content-Type', 'application/json');
            if (err) {
                res.end(JSON.stringify({
                    ERROR: err
                }));
                return;
            }
            if (rez > 0) //mysql & mssql difference
                res.end(JSON.stringify(rez.recordsets[0]));
            else res.end(JSON.stringify(rez));
            return;
        }
    );
}

module.exports.con = connection;