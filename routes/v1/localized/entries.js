var express = require('express');
var router = express.Router();
var models = require('../../../models/index');
var Promise = require('bluebird');

/* GET languages listing. */
router.get('/', function(req, res, next) {
    models.LocalizedEntry.findAll().then(function (entries) {
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

router.get('/:lc/:entryId/html', function(req, res, next){
    "use strict";
    models.LocalizedEntry.findOne({ where:
        {
            EntryId: req.params.entryId,
            LanguageIsoCode: req.params.lc
        }
    }).then(function (entry) {
        "use strict";
        entry.getHtml().then(function(html){
            res.send(html);
        });

        //res.send(entries);
    });
});

module.exports = router;
