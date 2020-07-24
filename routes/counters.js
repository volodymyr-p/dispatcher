'use strict';
// TODO: Rewrite. The ultimate business logic is not yet known
// TODO: Filter
const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const formidable = require('formidable');
const auth = require('../code/authentication');
const jsonParser = bodyParser.json();
const fs = require('fs')

const loc = require('../code/locale');
//Connection to DB
const db = require('../code/database');
const connection = db.con;

// Types of uploaded files
const fileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/raw', 'image/tif', 'image/tif'];

//confin in js, if need some not in pug
let configjs = {}

router.get('/getConfig', function (req, res) {
  auth.check({
    req: req,
    res: res,
  }, (user) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(configjs);
  });
});

router.get('/', (req, res) => {
  auth.check({
    req: req,
    res: res,
  }, (user) => {
    let config = {
      //route name pun in dom to #pageinfo
      page: "counters",
    }
    //pug file
    res.render("counters", getlocale(req, config));
  });
});

router.get('/getTable', function (req, res) {
  auth.check({
    req: req,
    res: res,
  }, (user) => {
    //res.setHeader('Content-Type', 'application/json');
    let lang = req.cookies.lang;
    const is_archive = req.query.is_archive;
    const date_from = req.query.date_from;
    const date_to = req.query.date_to;
    const id_organization = user.id_organization

    let query = `SELECT concat(second_name, ' ', first_name, ' ', middle_name) as full_name, 
      uploaded_counter_photos.id_upload, uploaded_counter_photos.file_name, 
      city, street, house_number, flat_number, 
      counter_number, description, upload_date, counter_value, is_processed
      FROM uploaded_counter_photos 
      INNER JOIN uploaded_counter_photos_info 
        ON uploaded_counter_photos.id_upload = uploaded_counter_photos_info.id_upload
      INNER JOIN users 
        ON uploaded_counter_photos_info.id_user = users.id_user `;
    if (user.user_role == "SUPERADMIN")
      query += '';
    else if (user.user_role == "ADMIN" || user.user_role == "OPERATOR")
      query += ` WHERE id_organization = ${user.id_organization}`;
    else if (user.user_role == "PERFOMER") {
      query += ` WHERE users.id_user = ${user.id_user}`;
    }
  
    if(is_archive === 'true'){
      query += ` AND is_processed = 1 AND upload_date BETWEEN '${date_from}' AND '${date_to}';`;
    } else {
      query += ` AND is_processed = 0;`
    }


    connection.query(query, function (err, rows, fields) {
      if (err) {
        res.status(400);
        res.send(err);
        return;
      }
      // Group file_name by id_upload
      // TODO: Try refactoring
      let data = [];
      let tempUploadID = (rows[0]) ? rows[0].id_upload : 0;
      let tempPhotosData = [];
      let tempMainData;
      
      for (let i = 0; i < rows.length; i++) {
        let address = ``;
        rows[i].city ? address += `м. ${rows[i].city},` : null;
        rows[i].street ? address += ` вул. ${rows[i].street},` : null;
        rows[i].house_number ? address += ` буд. ${rows[i].house_number},` : null;
        rows[i].flat_number ? address += ` кв. ${rows[i].flat_number}` : null;

        if (tempUploadID === rows[i].id_upload) {
          tempMainData = [rows[i].id_upload, rows[i].counter_number, rows[i].full_name, rows[i].upload_date.toLocaleString(), address, rows[i].description, rows[i].counter_value, rows[i].is_processed];
          tempPhotosData.push(rows[i].file_name);
        }
        else {
          data.push([...tempMainData, tempPhotosData]);
          tempMainData = [rows[i].id_upload, rows[i].counter_number, rows[i].full_name, rows[i].upload_date.toLocaleString(), address, rows[i].description, rows[i].counter_value, rows[i].is_processed];
          tempPhotosData = [rows[i].file_name];
        }

        tempUploadID = rows[i].id_upload;
      }
      
      if (rows[0]) {
        data.push([...tempMainData, tempPhotosData]);
      }

      res.send({
        head: [{
          title: loc.getWord(lang, "number")
        },
        {
          title: loc.getWord(lang, "counter_number")
        },
        {
          title: loc.getWord(lang, "pass_meter_readings")
        },
        {
          title: loc.getWord(lang, "date")
        },
        {
          title: loc.getWord(lang, "address")
        },
        {
          title: loc.getWord(lang, "description")
        },
        {
          title: loc.getWord(lang, "image")
        }
        ],
        //First MUST! be ID
        body: data
      });
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
    const id = req.body.id;

    // Selecting file names which will be deleted from server folder
    connection.query('SELECT file_name FROM uploaded_counter_photos WHERE id_upload = ?;', id, function (err, fileNamesForDeleting, fields) {
      // Deleting from rows from DB
      connection.query(`DELETE FROM uploaded_counter_photos WHERE id_upload = ${id};
                DELETE FROM uploaded_counter_photos_info WHERE id_upload = ${id};
                SELECT file_name FROM uploaded_counter_photos WHERE id_upload = ${id};`, function (err) {
        if (err) {
          res.status(400);
          res.send(err);
        } else {
          // Deleting files from folder
          fileNamesForDeleting.forEach(filePart => {
            fs.unlink(`./public/uploads/${filePart.file_name}`, (err) => {
              if (err) {
                console.error(err)
                return;
              }
            })
          })
          res.status(200).json('ok');
        }
      })
    })
  });
})

router.post('/upload', function (req, res) {
  auth.check({
    req: req,
    res: res,
    roles: ["SUPERADMIN", "ADMIN", "OPERATOR", "PERFOMER"]
  }, (user) => {
    let form = new formidable.IncomingForm();
    const responseData = [];
    form.parse(req, function (err, fields, files) {
      let flat = fields.flat_number;
      let counter_number = fields.counter_number;

      if(fields.isPrivateHouse) { flat = null }
      if(fields.counter_number == 'null') { counter_number = null }

      const data = {
        id_user: user.id_user,
        city: fields.city,
        street: fields.street,
        house_number: fields.house_number,
        flat_number: flat,
        counter_number: counter_number,
        description: fields.description
      };
      
      connection.query(`INSERT INTO uploaded_counter_photos_info SET ?;`, data, function (err, result, field) {
        if (err) {
          res.status(400);
          res.send(err);
        } 
        // Uploaded photo names
        const insertedPhotos = [];
        Object.keys(files).forEach((key, index) => {
          insertedPhotos.push([result.insertId, files[key].name]);
        });

        connection.query(`INSERT INTO uploaded_counter_photos(id_upload, file_name) VALUES ? ;`, [insertedPhotos], function (err, results, fields) {
          if (err) {
            res.status(400);
            res.send(err);
          }
        });
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

    form.on('file', function (name, file) {
      responseData.push(file.name)
    });

    form.on('end', function () {
      res.send(responseData);
    });

  });
});

router.put('/SetCounterValue', function (req, res) {
  auth.check({
    req: req,
    res: res,
    roles: ["SUPERADMIN", "ADMIN", "OPERATOR"]
  }, () => {
    //res.setHeader('Content-Type', 'application/json');
    const {counter_value, counter_number, id_upload } = req.body;

    //counter_number может быть пустым. достаточно id_upload
    let query = `UPDATE uploaded_counter_photos_info SET counter_value = ${counter_value}, is_processed = true
    WHERE id_upload = ${id_upload} ;`

    connection.query(query, function (err, results, fields) {
      if (err) {
        res.status(400);
        res.send(err);
        return;
      } else {
        res.status(200).json({status:"ok"})
      }
    })
  });
});

module.exports = router;