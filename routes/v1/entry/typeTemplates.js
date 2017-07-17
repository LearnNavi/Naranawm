const express = require('express');
const router = express.Router();
const models = require('../../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.EntryTypeTemplates.findAll().then(function (templates) {
        "use strict";
        res.send(templates);
    });

});

module.exports = router;
