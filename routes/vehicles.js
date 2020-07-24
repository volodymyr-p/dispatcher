'use strict';
const express = require('express');
const router = express.Router();
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
        page: "vehicles",
        //Add button label
        addButton: "#add_vehicle",
        ArticlePost: "#vehicles"
    }
    //pug file
    res.render("addOrEditVehicle", getlocale(req, config));
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
        let query = 'SELECT * FROM vehicles where id_organization=?;';
        if (user.user_role == "SUPERADMIN") query = 'SELECT * FROM vehicles;';
        connection.query(query, [user.id_organization], function (err, rows, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            }

            let data = [];
            for (let i = 0; i < rows.length; i++) {
                data[i] = [rows[i].id_vehicle, rows[i].name, rows[i].notes];
            }

            res.send({
                head: [{
                        title: loc.getWord(lang, "number")
                    },
                    {
                        title: loc.getWord(lang, "name")
                    },
                    {
                        title: loc.getWord(lang, "notes")
                    }
                ],
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
            name: req.body.name,
            notes: req.body.notes,
            id_organization: user.id_organization
        };
        connection.query('INSERT INTO vehicles SET ? ;', data, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.json({
                    insertId: results.insertId
                });
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

        connection.query('DELETE FROM vehicles WHERE id_vehicle = ?', id, function (err, results, fields) {
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
        let name = req.body.form.name;
        let notes = req.body.form.notes;
        let id = req.body.id;

        connection.query('UPDATE vehicles SET name = ?, notes= ? WHERE id_vehicle = ?;', [name, notes, id], function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            }
            res.send("OK");
            console.log('Edit id_statment_variety = ', results.affectedRows);
        });
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

        connection.query('SELECT * FROM vehicles WHERE id_vehicle = ?;', id, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
                return;
            }

            let data;
            for (let i = 0; i < results.length; i++) {
                data = [results[i].name, results[i].notes];
            }
            res.send({
                head: [{
                    title: loc.getWord(lang, "name"),
                    id: "name"
                }, {
                    title: loc.getWord(lang, "notes"),
                    id: "notes"
                }],
                body: data
            });
        });
    });
});

router.get('/getVehicles', function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, (user) => {
        res.setHeader('Content-Type', 'application/json');
        let query = 'SELECT * FROM vehicles where id_organization=?;';
        if (user.user_role == "SUPERADMIN") query = 'SELECT * FROM vehicles;';
        connection.query(query, [user.id_organization], function (err, rows, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            }
            res.json(rows);
        });
    });
});

module.exports = router;