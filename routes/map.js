'use strict';
var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render("map", getlocale(req)); 
});

module.exports = router;
