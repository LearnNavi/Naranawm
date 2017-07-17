const express = require('express');
const router = express.Router();
const models = require('../../../models/index');
const Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.EntryTypeTemplates.findAll().then(function (typeTemplates) {
        "use strict";
        res.send(typeTemplates);
    });

});

module.exports = router;
