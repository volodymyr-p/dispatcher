'use strict';
var express = require('express');
var fs = require('fs');

var ru = JSON.parse(fs.readFileSync('./locale/ru.json', 'utf8'));
var en = JSON.parse(fs.readFileSync('./locale/en.json', 'utf8'));
var ua = JSON.parse(fs.readFileSync('./locale/ua.json', 'utf8'));

module.exports.getWord = function getWord(lang, key) {
    let word = "NONAME";
    switch (lang) {
        case "ru":
            word = ru[key];
            break;

        case "en":
            word = en[key];
            break;

        case "ua":
            word = ua[key];
            break;

        default:
            word = "NOLANG";
            break;
    }
    if (!word) word = "NONAME";

    return word;
}

module.exports.locales = {
    ru: ru,
    en: en,
    ua: ua
}

module.exports.getlocale = function getlocale(req, extension) {
    let loc = {};
    let lang = req.cookies.lang;
    if (lang) loc = module.exports.locales[lang];
    else loc = module.exports.locales.en;
    if (extension) {
        for (var prop in extension) {
            if ((typeof extension[prop]) == "string")
                if (extension[prop].startsWith("#"))
                    extension[prop] = loc[extension[prop].substring(1)];
        }
        extension.l = loc;
        return extension;
    } else {
        return {
            l: loc
        };
    }
}