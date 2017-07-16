var express = require('express');
var router = express.Router();
var models = require('../../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.DictionaryBlock.findAll().then(function (blocks) {
        "use strict";
        res.send(blocks);
    });

});

module.exports = router;
