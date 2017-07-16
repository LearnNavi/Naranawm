var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.Entry.findAll().then(function (entries) {
        "use strict";
        res.send(entries);
    });

});

module.exports = router;
