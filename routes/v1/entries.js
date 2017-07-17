const express = require('express');
const router = express.Router();
const models = require('../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.Entry.findAll().then(function (entries) {
        "use strict";
        res.send(entries);
    });

});

module.exports = router;
