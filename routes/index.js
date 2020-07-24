'use strict';
const express = require('express');
const router = express.Router();
const auth = require('../code/authentication');

router.get('/', function (req, res) {
    res.redirect('/statements');
});

router.post('/isLogin', function (req, res) {
    auth.checkToken({
        req: req,
        res: res
    }, () => {
        res.json({
            success: true,
            message: 'Token is valid, roles valid'
        });
    });
});

router.post('/getUser', function (req, res) {
    auth.getUser({
        req: req,
        res: res
    }, (r) => {
        res.json(r);
    });
});

router.post('/getlocale', function (req, res) {
    res.json({
        success: true,
        message: getlocale(req).l
    });
});

module.exports = router;