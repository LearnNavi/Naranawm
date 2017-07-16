var express = require('express');
var router = express.Router();
var models = require('../../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.EntryLayoutTemplates.findAll().then(function (layoutTemplates) {
        "use strict";
        res.send(layoutTemplates);
    });

});

module.exports = router;
