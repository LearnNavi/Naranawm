const express = require('express');
const router = express.Router();
const models = require('../../../models/index');
const Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.EntryLayout.findAll().then(function (layouts) {
        "use strict";
        res.send(layouts);
    });

});

module.exports = router;
