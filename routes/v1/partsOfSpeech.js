const express = require('express');
const router = express.Router();
const models = require('../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.PartOfSpeech.findAll().then(function (partsOfSpeech) {
        "use strict";
        res.send(partsOfSpeech);
    });

});

module.exports = router;
