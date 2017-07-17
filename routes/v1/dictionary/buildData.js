const express = require('express');
const router = express.Router();
const models = require('../../../models/index');
const Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.DictionaryBuildData.findAll().then(function (buildData) {
        "use strict";
        res.send(buildData);
    });

});

module.exports = router;
