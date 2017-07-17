const express = require('express');
const router = express.Router();
const models = require('../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.Metadata.findAll().then(function (metadata) {
        "use strict";
        res.send(metadata);
    });

});

module.exports = router;
