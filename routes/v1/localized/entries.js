const express = require('express');
const router = express.Router();
const models = require('../../../models/index');

/* GET languages listing. */
router.get('/:lc', function(req, res, next) {
    models.LocalizedEntry.findAll({ where:
        {
            LanguageIsoCode: req.params.lc
        }
    }).then(function (entries) {
        "use strict";
        res.send(entries);
    });

});

router.get('/:lc/:entryId/:type', function(req, res, next){
    "use strict";
    models.LocalizedEntry.findOne({ where:
        {
            EntryId: req.params.entryId,
            LanguageIsoCode: req.params.lc
        }
    }).then(function (entry) {
        "use strict";
        entry.getFormattedlayout(req.params.type).then(function(data){
            res.send(data);
        });

        //res.send(entries);
    });
});

module.exports = router;
