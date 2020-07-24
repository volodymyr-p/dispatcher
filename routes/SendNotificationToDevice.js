'use strict';
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require("body-parser");
const auth = require('../code/authentication');
const jsonParser = bodyParser.json();
const underscore = require('underscore');

//Connection to DB
const db = require('../code/database');
const loc = require('../code/locale');
const connection = db.con;

router.post('/SendNotificationToDevice', jsonParser, function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let id_team = req.body.id_team;
        let id_statement = req.body.id_statement;

        connection.query('SELECT * FROM v_showstatementjournal WHERE id_statment = ?', [id_statement], function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
                return;
            } else {
                //$.ajax({
                //    url: "https://fcm.googleapis.com/fcm/send",
                //    headers: {
                //        "Authorization": sessionStorage.getItem('Authorization')
                //    },
                //    contentType: "application/json",
                //    type: "POST",
                //    data: JSON.stringify({
                //        id_team: id_team,
                //        id_statement: id_statement
                //    }),
                //    success: function () {
                //    },
                //    error: onError
                //});
                console.log(results);
                res.status(200).json("OK");
            }
        });
    });
});

module.exports = router;