'use strict';
const express = require('express');
const router = express.Router();
const auth = require('../code/authentication');
const db = require('../code/database');
const connection = db.con;

const fileTypes = ['image/jpeg', 'image/png', 'image/gif',
  'video/mp4', 'video/avi', 'video/mpg', 'video/mov', 'video/swf',
  'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/aiff', 'audio/wma'];
const formidable = require('formidable');
router.post('/', function (req, res) {
  auth.check({
    req: req,
    res: res,
    roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
  }, (user) => {
    let form = new formidable.IncomingForm();
    const responseData = [];

    form.parse(req, function (err, fields, files) {
      const insertedData = [];
      Object.keys(files).forEach((key, index) => {
        insertedData.push([fields.id_statment, files[key].name]); //TODO: Description
      });

      connection.query(`INSERT INTO uploaded_files(id_statment, file_name) VALUES ?`, [insertedData], function (err, results, fields) {
        if (err) {
          res.status(400);
          res.send(err);
        }
      });
    });

    form.on('fileBegin', function (name, file) {
      let ticks = (((new Date()).getTime() * 10000) + 621355968000000000);
      file.name = ticks + "_" + file.name;
      file.path = __dirname + '/../public/uploads/' + file.name;
    });

    form.onPart = part => {
      if (!part.filename || fileTypes.indexOf(part.mime) !== -1) {
        // Let formidable handle the non file-pars and valid file types
        form.handlePart(part);
      }
    };

    form.on('progress', function (bytesReceived, bytesExpected) {
      let progress = {
        type: 'progress',
        bytesReceived: bytesReceived,
        bytesExpected: bytesExpected
      };
      // console.log("bytesReceived" + bytesReceived);
      // console.log("bytesExpected" + bytesExpected);
      //req.socket.broadcast(JSON.stringify(progress)); 
    });

    form.on('file', function (name, file) {
      responseData.push(file.name)
      console.log('Uploaded ' + file.name);
    });

      form.on('end', function () {
        res.send(responseData);
      });

  });
});

router.post('/updateMetersPhoto', function (req, res) {
  auth.check({
    req: req,
    res: res,
    roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
  }, (user) => {
    let form = new formidable.IncomingForm();
    const responseData = [];

    form.parse(req, function (err, fields, files) {
      // console.log({fields})
      // const insertedData = [];
      // Object.keys(files).forEach((key, index) => {
      //   insertedData.push([files[key].name]); //TODO: Description
      // });

      connection.query(`INSERT INTO uploaded_files(id_statment, file_name) VALUES ?`, [insertedData], function (err, results, fields) {
        if (err) {
          res.status(400);
          res.send(err);
        }
      });
    });

    form.on('fileBegin', function (name, file) {
      let ticks = (((new Date()).getTime() * 10000) + 621355968000000000);
      file.name = ticks + "_" + file.name;
      file.path = __dirname + '/../public/uploads/' + file.name;
    });

    form.onPart = part => {
      if (!part.filename || fileTypes.indexOf(part.mime) !== -1) {
        form.handlePart(part);
      }
    };

    form.on('progress', function (bytesReceived, bytesExpected) {
      let progress = {
        type: 'progress',
        bytesReceived: bytesReceived,
        bytesExpected: bytesExpected
      };
    });

    form.on('file', function (name, file) {
      responseData.push(file.name)
      console.log('Uploaded ' + file.name);
    });

    form.on('end', function () {
      res.send(responseData);
    });
  });
});

module.exports = router;