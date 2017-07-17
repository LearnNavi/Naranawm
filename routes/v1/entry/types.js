const express = require('express');
const router = express.Router();
const models = require('../../../models/index');
const Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.EntryType.findAll().then(function (types) {
        "use strict";
        res.send(types);
    });

});

module.exports = router;
