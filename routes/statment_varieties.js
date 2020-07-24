'use strict';
const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const bodyParser = require("body-parser");
const auth = require('../code/authentication');
const jsonParser = bodyParser.json();

const loc = require('../code/locale');
//Connection to DB
const db = require('../code/database');
const connection = db.con;

//confin in js, if need some not in pug
let configjs = {}

router.get('/getConfig', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(configjs);
});

router.get('/', function (req, res) {
    let config = {
        //route name pun in dom to #pageinfo
        page: "varieties",
        //Add button label
        addButton: "#add_varieties",
        ArticlePost: "#varieties"
    }
    //pug file
    res.render("addOrEditVarieties", getlocale(req, config));
});

router.get('/getTable', function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, (user) => {
        res.setHeader('Content-Type', 'application/json');
        let lang = req.cookies.lang;

        //next step from mysql
        let query = 'SELECT id_statement_variety, variety_name FROM statement_varieties where id_organization=?;';
        if (user.user_role == "SUPERADMIN") query = 'SELECT id_statement_variety, variety_name FROM statement_varieties;';
        connection.query(query, [user.id_organization], function (err, rows, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            }

            let data = [];
            for (let i = 0; i < rows.length; i++) {
                data[i] = [rows[i].id_statement_variety, rows[i].variety_name];
            }

            res.send({
                head: [{
                        title: loc.getWord(lang, "number")
                    },
                    {
                        title: loc.getWord(lang, "statement_variety")
                    }
                ],
                //First MUST! be ID
                body: data
            });
        });
    });
});

//Adding
router.post('/Add', jsonParser, function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, (user) => {
        let data = {
            variety_name: req.body.variety_name,
            id_organization: user.id_organization
        };
        connection.query('INSERT INTO statement_varieties SET ? ;', data, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            }else{                
                res.setHeader('Content-Type', 'application/json');
                res.json({insertId:results.insertId});
            }
        });        
    });
});

//Deleting
router.delete('/Delete', jsonParser, function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let id = req.body.id;

        connection.query('DELETE FROM statement_varieties WHERE id_statement_variety = ?', id, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            } else {
                res.status(200).json('ok');
            }
        });
    });
});


router.put('/Change', function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let data = req.body.form.variety_name;
        let id = req.body.id;

        connection.query('UPDATE statement_varieties SET variety_name = ? WHERE id_statement_variety = ?;', [data, id], function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            } else {
                res.status(200).json('ok');
            }
        });

        //res.send("OK"); //Server response
    });
});

router.post('/FillChangeForm', jsonParser, function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let id = req.body.id;
        let lang = req.cookies.lang;

        connection.query('SELECT variety_name FROM statement_varieties WHERE id_statement_variety = ?;', id, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
                return;
            }

            let data;
            for (let i = 0; i < results.length; i++) {
                data = [results[i].variety_name];
            }
            res.send({
                head: [{
                    title: loc.getWord(lang, "statement_variety"),
                    id:"variety_name"
                }],
                body: data
            });
        });
    });
});



module.exports = router;