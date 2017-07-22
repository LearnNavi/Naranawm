const express = require('express');
const router = express.Router();
const models = require('../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.LemmaClassType.findAll().then(function (classTypes) {
        "use strict";
        res.send(classTypes);
    });

});

module.exports = router;
