const express = require('express');
const router = express.Router();
const models = require('../../models');
const sqlite_models = require('../../sqlite_models');

function exportData(lc, model){
    "use strict";
    return models[model].findAll({where: {LanguageIsoCode: lc}}).then(function(sequlizeData){
        const data = sequlizeData.map(function(row){ return row.get({plain: true}); });
        return sqlite_models[model].bulkCreate(data);
    });
}

let exportPromise = sqlite_models.sequelize.sync({force: true});

const tables = [
    "Language",
    "Source",
    "Phoneme",
    "Grapheme",
    "GraphemePhonemeCorrespondence",
    "Metadata",
    "LocalizedMetadata",
    //"LemmaClassType",
    //"LemmaClassTypeAssociation",
    "MorphemeAffixType",
    "Morpheme",
    "MorphemeDefinition",
    "Lemma",
    "LemmaDefinition",
    "Lexeme"
];



/* GET languages listing. */
router.get('/:lc/sqlite', function(req, res, next) {
    for(let i = 0; i < tables.length; i++){
        exportPromise = exportPromise.then(function(){ return exportData(req.params.lc, tables[i]); });
    }
    exportPromise.then(function(){
        "use strict";
        console.log("Export Complete!!!", __dirname);
        res.sendFile("database.sqlite", {root: "./"});
    }).catch(function(error){
        console.log(error.original);
    });
});

module.exports = router;
