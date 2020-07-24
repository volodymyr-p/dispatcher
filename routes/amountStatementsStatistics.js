'use strict';
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require("body-parser");
const auth = require('../code/authentication');
const jsonParser = bodyParser.json();

//Connection to DB
const db = require('../code/database');
const connection = db.con;
const loc = require('../code/locale');

Date.prototype.yyyymmdd = function () {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [this.getFullYear(),
    (mm > 9 ? '' : '0') + mm,
    (dd > 9 ? '' : '0') + dd
    ].join('-');
};

//confin in js, if need some not in pug
let configjs = {}

router.get('/getConfig', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(configjs);
});

router.get('/', function (req, res) {
    let config = {
        //route name pun in dom to #pageinfo
        page: "amount-statements",
        ArticlePost: "#amount"
    }
    //pug file
    res.render("amountStatementsStatistics", getlocale(req, config));
});

router.get('/getTable', function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
    }, (user) => {
        res.setHeader('Content-Type', 'application/json');
        let lang = req.cookies.lang;

        let date_from = req.query.date_from;
        let date_to = req.query.date_to;
        let id_organization = user.id_organization
        
        let query = `SELECT count(id_statment) as amount, DATE(date_create) as created_date
        FROM statement_journal 
        INNER JOIN users ON statement_journal.id_user = users.id_user
        WHERE date_create BETWEEN ? AND ?`;

        if (user.user_role == "SUPERADMIN")
            query += ' ';
        else
            query += ' AND statement_journal.id_organization = ? ';

        query += ` GROUP BY created_date;`
        connection.query(query, [date_from, date_to, id_organization], function (err, rows, fields) {
                    if (err) {
                        res.status(400);
                        res.send(err);
                        return;
                    }

                    let data = [];
                    for (let i = 0; i < rows.length; i++) {
                        data[i] = [rows[i].amount, rows[i].created_date.yyyymmdd()];
                    }
                    res.send({
                        head: [{
                            title: loc.getWord(lang, "amount")
                        },
                        {
                            title: loc.getWord(lang, "date")
                        }
                        ],
                        //First MUST! be ID
                        body: data
                    });
                });
    });

});


module.exports = router;