const express = require('express');
const router = express.Router();
const models = require('../../../models/index');
const Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.DictionaryBuild.findAll().then(function (builds) {
        "use strict";
        res.send(builds);
    });

});

module.exports = router;
