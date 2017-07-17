const express = require('express');
const router = express.Router();
const models = require('../../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.EntryLayoutTemplates.findAll().then(function (layoutTemplates) {
        "use strict";
        res.send(layoutTemplates);
    });

});

module.exports = router;
