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
        page: "malfunctions",
        //Add button label
        addButton: "#add_malfunction",
        ArticlePost: "#malfunction"
    }
    //pug file
    res.render("addOrEditMalfunctions", getlocale(req, config));
});

router.get('/getTable', function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, (user) => {
        res.setHeader('Content-Type', 'application/json');
        let lang = req.cookies.lang;

        let query = 'SELECT id_malfunction, malfunction_name FROM malfunctions ';
        if (user.user_role == "SUPERADMIN")
            query += ';';
        else
            query += ' where id_organization = ?;';


        connection.query(query, [user.id_organization], function (err, rows, fields) {
            if (err) {
                res.status(400);
                res.send(err);
                return;
            }

            let malfunctions_data = [];
            for (let i = 0; i < rows.length; i++) {
                malfunctions_data[i] = [rows[i].id_malfunction, rows[i].malfunction_name];
            }

            res.send({
                head: [{
                        title: loc.getWord(lang, "number")
                    },
                    {
                        title: loc.getWord(lang, "malfunction")
                    }
                ],
                //First MUST! be ID
                body: malfunctions_data
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
            malfunction_name: req.body.malfunction_name,
            id_organization: user.id_organization
        };
        connection.query('INSERT INTO malfunctions SET ?', data, function (err, results, fields) {
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

        connection.query('DELETE FROM malfunctions WHERE id_malfunction = ?', id, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
                return;
            }
            console.log('Deleted Row(s):', results.affectedRows);
        });

        //res.send("OK"); //Server response
    });
});


router.put('/Change', function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let data = req.body.form.malfunction_name;
        let id = req.body.id;

        connection.query('UPDATE malfunctions SET malfunction_name = ? WHERE id_malfunction = ?;', [data, id], function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
                return;
            }
            console.log('Edit id_malfunction = ', results.affectedRows);
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

        connection.query('SELECT malfunction_name FROM malfunctions WHERE id_malfunction = ?;', id, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
                return;
            }

            let data;
            for (let i = 0; i < results.length; i++) {
                data = [results[i].malfunction_name];
            }
            res.send({
                head: [{
                    title: loc.getWord(lang, "malfunction"),
                    id: "malfunction_name"
                }],
                body: data
            });
        });

        //res.send("OK"); //Server response
    });
});



module.exports = router;