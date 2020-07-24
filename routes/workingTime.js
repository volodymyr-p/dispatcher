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

//confin in js, if need some not in pug
const configjs = {}

router.get('/getConfig', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(configjs);
});

router.get('/', function (req, res) {
  auth.check({
    req: req,
    res: res,
    roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
  }, (user) => {
    connection.query(`SELECT date_start, is_in_process 
    FROM working_hours 
    WHERE is_in_process = true AND id_user = ?;`, [user.id_user], function (err, results, fields) {
        if (err) {
          res.status(400);
          res.send(err);
        } 
        else {
          let isInProcess;
          let dateStart;
          if (results[0]) {
            isInProcess = true;
            dateStart = results[0].date_start;
          } else {
            isInProcess = false;
            dateStart = null;
          }

          const config = {
            //route name pun in dom to #pageinfo
            page: "working-time",
            //Start button label
            addButton: "#start_shift",
            //Time tracking data
            shiftData: {
              isInProcess: isInProcess,
              dateStart: dateStart
            }
          }
          //pug file
          res.render("workingTime", getlocale(req, config));
        }
      });
  });
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

    let query = `SELECT id_working_time, date_start, date_end, TIMESTAMPDIFF(SECOND,date_start, date_end) as workingTime
        FROM working_hours 
        INNER JOIN users 
        ON working_hours.id_user = users.id_user
        WHERE date_start >= ? AND date_end <= ? AND is_in_process = false AND working_hours.id_user = ?`;

    //next step from mysql
    connection.query(query, [date_from, date_to, user.id_user], function (err, rows, fields) {
      if (err) {
        res.status(400);
        res.send(err);
        return;
      }

      let varieties_data = [];
      let start_date;
      let end_date;
      for (let i = 0; i < rows.length; i++) {
        start_date = rows[i].date_start.getFullYear() + "-" + (rows[i].date_start.getMonth() + 1) + "-" + rows[i].date_start.getDate()
          + " " + rows[i].date_start.getHours() + ":" + rows[i].date_start.getMinutes() + ":" + rows[i].date_start.getSeconds();
        end_date = rows[i].date_end.getFullYear() + "-" + (rows[i].date_end.getMonth() + 1) + "-" + rows[i].date_end.getDate()
          + " " + rows[i].date_end.getHours() + ":" + rows[i].date_end.getMinutes() + ":" + rows[i].date_end.getSeconds();
        
          varieties_data[i] = [
          start_date + '<br>' + end_date,
          convertHMS(rows[i].workingTime)
        ];
      }
      res.send({
        head: [
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

//Start a shift
router.post('/Start', jsonParser, function (req, res) {
  auth.check({
    req: req,
    res: res,
    roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
  }, (user) => {
    connection.query(`INSERT INTO working_hours(id_user, date_start, is_in_process) 
    VALUES(?, CURRENT_TIMESTAMP, true);`, [user.id_user], function (err, results, fields) {
        if (err) {
            res.status(400);
            res.setHeader('Content-Type', 'application/json');
            res.json({ errMessage: err.sqlMessage, ok: false });
        } else {
            console.log("User " + user.id_user + " started a shift");
          res.status(200);
          res.setHeader('Content-Type', 'application/json');
            res.json({ insertId: results.insertId, ok: true });
        }
      });
  });
});

//End a shift
router.put('/End', function (req, res) {
  auth.check({
    req: req,
    res: res,
    roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
  }, (user) => {
    connection.query(`UPDATE working_hours 
      SET date_end = CURRENT_TIMESTAMP, is_in_process = false 
      WHERE is_in_process = true AND id_user = ?;`, [user.id_user], function (err, results, fields) {
            console.log('end id ----');
            if (err) {
                res.status(400);
                //res.setHeader('Content-Type', 'application/json');
                res.json({ errMessage: err, ok: false});
                //res.send(err);
                return;
            } else {
                res.status(200);
                res.send("ok");
            }
        console.log('Edit id_working_time = ', results.affectedRows);
      });
  });
});

module.exports = router;