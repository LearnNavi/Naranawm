const express = require('express');
const router = express.Router();
const config = require("../../config");
const debug = require('debug')('Naranawm:rebuild');

const Dictionary = require('../../eanaEltuMigration/dictionary');


/* GET rebuild data from EE */
router.get('/eanaEltu', function(req, res, next) {
    //debug.log = res.write.bind(res);
    const dictionary = new Dictionary();
    debug("Starting Database Rebuild...");
    dictionary.buildDictionary(function(){
        // We have a full Dictionary now to do things with :)

        dictionary.export(function(){
            debug("Export Complete!!!");
            res.send("Rebuild Complete!");
        });
    });
});

module.exports = router;
