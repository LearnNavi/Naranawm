const express = require('express');
const router = express.Router();
const models = require('../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.Language.findAll().then(function (languages) {
        "use strict";
        res.send(languages);
    });

});

module.exports = router;
