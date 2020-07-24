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

function isStr(s, strbeforeb) {
  if (s == null) return ""
  else if (s == undefined) return ""
  else if (s == "") return ""
  if (strbeforeb) return strbeforeb + s;
  else return s;
};

function convertHMS(value) {
  const sec = parseInt(value, 10); // convert value to number if it's string
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - (hours * 3600)) / 60); // get minutes
  let seconds = sec - (hours * 3600) - (minutes * 60); //  get seconds
  // add 0 if value < 10
  if (hours < 10) { hours = "0" + hours; }
  if (minutes < 10) { minutes = "0" + minutes; }
  if (seconds < 10) { seconds = "0" + seconds; }
  return hours + ':' + minutes + ':' + seconds; // Return is HH : MM : SS
}

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
    page: "working-statistics-calendar",
    ArticlePost: "#working-statistics"
  }
  //pug file
  res.render("workingHoursStatisticsCalendar", getlocale(req, config));
});

router.get('/getTable', function (req, res) {
  auth.check({
    req: req,
    res: res,
    roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
  }, (user) => {
    res.setHeader('Content-Type', 'application/json');
    let lang = req.cookies.lang;

    // let date_from = req.query.date_from;
    // let date_to = req.query.date_to;
    let id_user = req.query.id_user;
    if (!id_user) {
      id_user = -1;
    }

    let query = `SELECT id_working_time, working_hours.id_user, first_name, second_name, middle_name, 
        DATE(date_start) as dateStart, sum(TIMESTAMPDIFF(SECOND,date_start, date_end)) as workingTime 
        FROM working_hours 
        INNER JOIN users 
        ON working_hours.id_user = users.id_user 
        WHERE is_in_process = false`;

    if (user.user_role == "ADMIN" || user.user_role == "OPERATOR" || user.user_role == "SUPERADMIN") {
      query += ` AND users.id_user = ${id_user}`;
    } else {
      query += ` AND users.id_user = ${user.id_user}`;
    }

    query += ` GROUP BY working_hours.id_user, dateStart`;
    //next step from mysql
    connection.query(query, function (err, rows, fields) {
      if (err) {
        res.status(400);
        res.send(err);
        return;
      }

      let varieties_data = [];
      for (let i = 0; i < rows.length; i++) {
        varieties_data[i] = [
          isStr(rows[i].second_name) + ' ' + isStr(rows[i].first_name) + ' ' + isStr(rows[i].middle_name),
          rows[i].dateStart.yyyymmdd(),
          convertHMS(rows[i].workingTime)
        ];
      }
      res.send({
        head: [{
          title: loc.getWord(lang, "fullName")
        },
        {
          title: loc.getWord(lang, "date")
        },
        {
          title: loc.getWord(lang, "working_time")
        }
        ],
        //First MUST! be ID
        body: varieties_data
      });
    });
  });
});

router.get('/getUsers', function (req, res) {
  auth.check({
    req: req,
    res: res,
    roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
  }, (user) => {
    res.setHeader('Content-Type', 'application/json');

    let query = `SELECT id_user, first_name, second_name, middle_name 
      FROM users 
      WHERE user_role = 'PERFOMER'`;

    if (user.user_role == "SUPERADMIN")
      query += ' ;';
    else if (user.user_role == "ADMIN" || user.user_role == "OPERATOR")
      query += ' AND users.id_organization = ?;';
    else
      query += ' AND id_organization = ? AND id_user = ?;';

    connection.query(query, [user.id_organization, user.id_user], function (err, rows, fields) {
      if (err) {
        res.status(400);
        res.send(err);
        return;
      }
      let data = rows;

      res.send(JSON.stringify(data));
    });
  });
});

module.exports = router;