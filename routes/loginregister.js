'use strict';
var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var path = require('path');
var db = require('../code/database');
var auth = require('../code/authentication');

var connection = db.con;

router.get('/', function (req, res) {
    res.render("login", getlocale(req));
});

router.post('/register', function (req, res) {
    // console.log("req",req.body);
    var today = new Date();
    var users = {
        "first_name": req.body.first_name,
        "last_name": req.body.last_name,
        "email": req.body.email,
        "password": req.body.password,
        "created": today,
        "modified": today
    }
    connection.query('INSERT INTO users SET ?', users, function (error, results, fields) {
        if (error) {
            console.log("error ocurred", error);
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            console.log('The solution is: ', results);
            res.send({
                "code": 200,
                "success": "user registered sucessfully"
            });
        }
    });
});

router.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    db.checkUser(email, password)
        .then(
            passhash => auth.getToken(passhash, email, password)
        ).then(
            token => res.send(token)
        ).catch(
            error => {
                if (typeof error === 'object' && ('message' in error))
                    res.status(500).send(error.message);
                else
                res.status(500).send(error);
            }
        );
});

module.exports = router;