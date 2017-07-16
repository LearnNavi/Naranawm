var express = require('express');
var router = express.Router();
var models = require('../../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.EntryTypeTemplates.findAll().then(function (typeTemplates) {
        "use strict";
        res.send(typeTemplates);
    });

});

module.exports = router;
