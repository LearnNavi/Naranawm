const express = require('express');
const router = express.Router();
const models = require('../../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.LocalizedEntryLayout.findAll().then(function (layouts) {
        "use strict";
        res.send(layouts);
    });

});

module.exports = router;
