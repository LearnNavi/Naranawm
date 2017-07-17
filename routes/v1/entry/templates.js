var express = require('express');
var router = express.Router();
var models = require('../../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.EntryTemplate.findAll().then(function (templates) {
        "use strict";
        res.send(templates);
    });

});

module.exports = router;
