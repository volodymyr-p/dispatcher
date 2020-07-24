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
        page: "organizations",
        //Add button label
        addButton: "#add_organization",
        ArticlePost: "#organization"
    }
    //pug file
    res.render("addOrEditOrganization", getlocale(req, config));
});

router.get('/getTable', function (req, res) {

    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let lang = req.cookies.lang;

        connection.query('SELECT id_organization, organization_name, description FROM organizations;', function (err, rows, fields) {
            if (err) {
                res.status(400);
                res.send(err);
                return;
            }


            let organizations_data = [];
            for (let i = 0; i < rows.length; i++) {
                organizations_data[i] = [rows[i].id_organization, rows[i].organization_name, rows[i].description];
            }
            res.send({
                head: [{
                        title: loc.getWord(lang, "number")
                    },
                    {
                        title: loc.getWord(lang, "name")
                    },
                    {
                        title: loc.getWord(lang, "description")
                    }
                ],
                //First MUST! be ID
                body: organizations_data
            });
        });
    });

});

//Adding
router.post('/Add', jsonParser, function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let organization_name = req.body.organization_name;
        let description = req.body.description;

        connection.query('INSERT INTO organizations(organization_name, description) VALUES(?, ?);', [organization_name, description], function (error, results, fields) {
            if (error) throw error;
        });
    });
});

//Deleting
router.delete('/Delete', jsonParser, function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let id = req.body.id;

        connection.query('DELETE FROM organizations WHERE id_organization = ?', id, function (error, results, fields) {
            if (error)
                return console.error(error.message);
        });
    });
});


router.put('/Change', function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let name = req.body.form.organization_name;
        let id = req.body.id;
        let description = req.body.form.description;

        connection.query('UPDATE organizations SET organization_name = ?, description = ? WHERE id_organization = ?;', [name, description, id], function (error, results, fields) {
            if (error) throw error;
        });
    });
});

router.post('/FillChangeForm', jsonParser, function (req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN"]
    }, () => {
        res.setHeader('Content-Type', 'application/json');
        let id = req.body.id;
        let lang = req.cookies.lang;

        connection.query('SELECT organization_name, description FROM organizations WHERE id_organization = ?;', id, function (err, results, fields) {
            if (err) {
                res.status(400);
                res.send(err);
                return;
            }

            let data;
            for (let i = 0; i < results.length; i++) {
                data = [results[i].organization_name, results[i].description];
            }
            res.send({
                head: [{
                        title: loc.getWord(lang, "name"),
                        id: "organization_name"
                    },
                    {
                        title: loc.getWord(lang, "description"),
                        id: "description"
                    }
                ],
                body: data
            });
        });

        //res.send("OK"); //Server response
    });
});

router.get('/getUsersFromOrganization', function (req, res) {
    auth.check({
        req: req,
        res: res,   
        roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
    }, (user) => {
        res.setHeader('Content-Type', 'application/json');
        const currentOrganizationId = user.id_organization;

        connection.query('SELECT id_user, id_team, first_name, second_name, middle_name, id_organization FROM users WHERE id_organization = ?;', 
        [currentOrganizationId], function (error, results, fields) {
            if (error) {
                res.status(400);
                res.send(error);
                return;
            } else {
                res.status(200);
                res.send(results);
            }
        });
    });
});
module.exports = router;