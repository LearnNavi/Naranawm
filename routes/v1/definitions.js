const express = require('express');
const router = express.Router();
const models = require('../../models/index');

/* GET languages listing. */
router.get('/:lc', function(req, res, next) {
    models.Definition.findAll({ where:
        {
            LanguageIsoCode: req.params.lc
        }
    }).then(function (definitions) {
        "use strict";
        res.send(definitions);
    });

});

router.get('/:lc/:lemmaId/:type', function(req, res, next){
    "use strict";
    models.Definition.findOne({ where:
        {
            LemmaId: req.params.lemmaId,
            LanguageIsoCode: req.params.lc
        }
    }).then(function (definition) {
        "use strict";
        definition.getFormattedlayout(req.params.type).then(function(data){
            res.send(data);
        });

        //res.send(entries);
    });
});

module.exports = router;
