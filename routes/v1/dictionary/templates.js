const express = require('express');
const router = express.Router();
const models = require('../../../models/index');
const Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.DictionaryTemplate.findAll().then(function (templates) {
        "use strict";
        res.send(templates);
    });

});

module.exports = router;
