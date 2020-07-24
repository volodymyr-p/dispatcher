'use strict';
var express = require('express');
var router = express.Router();

const db = require('../code/database');
const connection = db.connection;
const returnall = db.returnall;
const dojob = db.dojob;
const auth = require('../code/authentication');

router.get('/', function(req, res) {
    res.render("locationMap", getlocale(req));
});

router.get('/Users', function(req, res) {
    auth.check({
        req: req,
        res: res
    }, () => {
        let rq = `Select * from location_users`;
        dojob(rq, res);
    });
});

router.post('/DeleteUser', function(req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN"]
    }, () => {
        let rq = `DELETE FROM location_users WHERE device_id = '${req.body.DeviceID}'`;
        dojob(rq, res);
    });
});

router.post('/Deactivate', function(req, res) {
    auth.check({
        req: req,
        res: res,
        roles: ["SUPERADMIN", "ADMIN"]
    }, () => {
        let rq = `UPDATE location_users SET is_active = 0 WHERE device_id = '${req.body.DeviceID}'`;
        dojob(rq, res);
    });
});

router.post('/UserLocation', function(req, res) {
    auth.check({
        req: req,
        res: res
    }, () => {
        let rq = `SELECT * FROM location_coords WHERE date_create > DATE_SUB(NOW(), INTERVAL 2 DAY) and location_user_device_id = '${req.body.DeviceID}' order by date_create asc`;
        dojob(rq, res);
    })
});

router.post('/UserLocationDated', function(req, res) {
    auth.check({
        req: req,
        res: res
    }, () => {
        let from = localISOTime_string(req.body.datefrom);
        let to = localISOTime_string(req.body.dateto);
        let rq = `SELECT * FROM location_coords WHERE date_create >= '${from}' and date_create<='${to}' and location_user_device_id = '${req.body.DeviceID}' order by date_create asc`;
        dojob(rq, res);
    })
});


//====================Track Location======================
router.post('/', function(req, res) {
    let url = req.originalUrl;
    url = decodeURI(url);
    url = url.substring(req.baseUrl.length + 1)

    let a = url.split('&');
    let longitude = "";
    let latitude = "";
    let deviceID = "";
    let accuracy = "";
    let timestamp = "";
    let speed = "";
    a.map(function(el) {
        if (el.startsWith("id=")) deviceID = el.substring(3);
        if (el.startsWith("lon=")) longitude = el.substring(4);
        if (el.startsWith("lat=")) latitude = el.substring(4);
        if (el.startsWith("accuracy=")) accuracy = el.substring(9);
        if (el.startsWith("speed=")) speed = el.substring(6);
        if (el.startsWith("timestamp=")) timestamp = el.substring(10);
    })
    res.sendStatus(200)

    createUserifNotExist(deviceID);
    saveCoords(deviceID, longitude, latitude, accuracy, timestamp, speed)
});

function createUserifNotExist(deviceID) {
    let request = `INSERT IGNORE INTO location_users SET device_id = '${deviceID}', custom_name = '${deviceID}';`
    returnall(request, (err, result) => {
        if (err) {
            console.log(err);
        } else {}
    })
}

function saveCoords(deviceID, longitude, latitude, accuracy, timestamp, speed) {
    var date = localISOTime(timestamp);
    console.log(date + " : " + deviceID + " : " + longitude + " " + latitude);
    let rq = `INSERT INTO location_coords SET date_create = '${date}', longitude = ${longitude}, latitude = ${latitude}, accuracy = ${accuracy}, speed = ${speed}, location_user_device_id = '${deviceID}';`;
    returnall(rq, (err, result) => {
        if (err) {
            console.log(err);
        }
    })
}

function localISOTime(timestamp) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(new Date(timestamp * 1000) - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
    return localISOTime;
}

function localISOTime_string(string_date) {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var localISOTime = (new Date(new Date(string_date) - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
    return localISOTime;
}

module.exports = router;