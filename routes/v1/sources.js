const express = require('express');
const router = express.Router();
const models = require('../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.Source.findAll().then(function (sources) {
        "use strict";
        res.send(sources);
    });

});

module.exports = router;
