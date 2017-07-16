var express = require('express');
var router = express.Router();
var models = require('../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.Language.findAll().then(function (languages) {
        "use strict";
        res.send(languages);
    });

});

module.exports = router;
