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
        page: "teams",
        //Add button label
        addButton: "#add_team",
        ArticlePost: "#teams"
    }
    res.render("addOrEditTeam", getlocale(req, config));
});

router.get('/getTable', function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, (user) => {
        res.setHeader('Content-Type', 'application/json');
        let lang = req.cookies.lang;

        let query = 'SELECT * FROM teams where id_organization=?;';

        if (user.user_role == "SUPERADMIN") {
            query = 'SELECT * FROM teams;';
        }

        connection.query(query, [user.id_organization], function (err, rows, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            }

            let data = [];
            for (let i = 0; i < rows.length; i++) {
                data[i] = [rows[i].id_team, rows[i].name, rows[i].notes, rows[i].id_vehicle];
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
                    },
                    {
                        title: loc.getWord(lang, "vehicle")
                    }
                ],
                body: data
            });
        });
    });
});

router.get('/getTeams', function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, (user) => {
        res.setHeader('Content-Type', 'application/json');
        let query = 'SELECT * FROM teams where id_organization=?;';

        if (user.user_role == "SUPERADMIN") {
            query = 'SELECT * FROM teams;';
        }
        connection.query(query, [user.id_organization], function (err, rows, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            } else {
                res.json(rows);
            }
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
        const id = req.body.id;
        const lang = req.cookies.lang;

        connection.query('SELECT * FROM teams WHERE id_team = ?;', id, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
                return;
            }

            let data;
            for (let i = 0; i < results.length; i++) {
                data = [results[i].name, results[i].notes, results[i].id_vehicle];
            }
            res.send({
                head: [{
                    title: loc.getWord(lang, "name"),
                    id: "name"
                }, {
                    title: loc.getWord(lang, "notes"),
                    id: "notes"
                }, {
                    title: loc.getWord(lang, "vehicle"),
                    id: "vehicle"
                }],
                body: data
            });
        });
    });
});

router.put('/Add', jsonParser, function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, (user) => {
        res.setHeader('Content-Type', 'application/json');

        const {name, notes} = req.body.form;
        const { id, selected_users} = req.body;
        let vehicle = req.body.form.vehicle;
        
        if (vehicle == "") {
            vehicle = null;
        }
        
        // editing general info 
        let query = `INSERT INTO teams(name, notes, id_vehicle, id_organization) VALUES('${name}', '${notes}', ${vehicle}, ${user.id_organization});`;
                
        connection.query(query, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            } else{
                res.json("OK");
            }
        });
    });``
});

router.delete('/Delete', jsonParser, function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let id = req.body.id;

        connection.query('DELETE FROM teams WHERE id_team = ?', id, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            }
            res.status(200).json('ok');
        });
    });
});

router.put('/Change', function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, () => {
        //res.setHeader('Content-Type', 'application/json');
        const {name, notes} = req.body.form;
        const { id, selected_users, deSelectedUsers} = req.body;
        let vehicle = req.body.form.vehicle;

        if (vehicle == "") {
            vehicle = null;
        }

        // editing general info 
        let query = `UPDATE teams SET name = "${name}", notes= "${notes}", id_vehicle = ${vehicle} WHERE id_team = ${id};`;
        // setting users id_team
        if(selected_users.length > 0){
            query+=` UPDATE users SET id_team = ${id} WHERE id_user IN (${selected_users});`
        }
        // deleting id_team in unselected users
        if(deSelectedUsers.length > 0){
            query+=` UPDATE users SET id_team = NULL WHERE id_user IN (${deSelectedUsers});`
        }   

        connection.query(query,  function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
            } else {
                res.status(200).json("OK");
            }
        });
    });
});

module.exports = router;