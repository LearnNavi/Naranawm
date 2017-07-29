const express = require('express');
const router = express.Router();
const models = require('../../models');
const Sqlite_models = require('../../models/sqlite');
const debug = require('debug')('Naranawm:API_V1_EXPORT');

const tablesThatNeedLanguageIsoCode = [
    "LemmaDefinition",
    "LocalizedMetadata",
    "MorphemeDefinition",
    "LemmaClassType"
];

function exportData(sqlite, lc, model){
    "use strict";
    debug("Exporting: ", model);
    let where;
    if(models[model].rawAttributes.LanguageIsoCode !== undefined && tablesThatNeedLanguageIsoCode.indexOf(model) === -1){
        where = { where: {LanguageIsoCode: lc}};
        sqlite[model].removeAttribute("LanguageIsoCode");
    }

    return sqlite[model].sync({force: true}).then(function(){
        return models[model].findAll(where).then(function(sequlizeData){
            const data = sequlizeData.map(function(row){ return row.get({plain: true}); });
            return sqlite[model].bulkCreate(data);
        });
    });
}

const tables = [
    "Grapheme",
    "GraphemePhonemeCorrespondence",
    "Language",
    "Lemma",
    "LemmaClassType",
    "LemmaClassTypeAssociation",
    "LemmaDefinition",
    "Lexeme",
    "LocalizedMetadata",
    "Metadata",
    "Morpheme",
    "MorphemeAffixType",
    "MorphemeDefinition",
    "Phoneme",
    "Source"
];

/* GET languages listing. */
router.get('/:lc/sqlite', function(req, res, next) {
    const sqlite = Sqlite_models();
    let exportPromise = sqlite.sequelize.query("PRAGMA foreign_keys = OFF").then(function(){
        return sqlite.sequelize.sync({force: true});
    });
    for(let i = 0; i < tables.length; i++){
        const table = tables[i];
        exportPromise = exportPromise.then(function(){ return exportData(sqlite, req.params.lc, table); });
    }
    return exportPromise.then(function(){
        "use strict";
        return sqlite.sequelize.query('PRAGMA foreign_keys = ON').then(function(){
            debug("Export Complete!!!", sqlite.file);
            res.setHeader('Content-disposition', 'attachment; filename=database.sqlite');
            res.setHeader('Content-type', 'application/x-sqlite3');
            res.sendFile(sqlite.file);
        });
    }).catch(function(error){
        debug("Error: ", error);
    });
});

module.exports = router;
