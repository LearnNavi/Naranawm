const express = require('express');
const router = express.Router();
const models = require('../../../models/index');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.DictionaryBlock.findAll().then(function (blocks) {
        "use strict";
        res.send(blocks);
    });

});

module.exports = router;
