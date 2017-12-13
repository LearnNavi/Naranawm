const express = require('express');
const router = express.Router();
const models = require('../../models');
const Sqlite_models = require('../../models/sqlite');
const debug = require('debug')('Naranawm:API_V1_EXPORT');
const Dictionary = require('../../controllers/dictionary');
const Xliff = require('../../controllers/xliff');
const latex = require('node-latex');
const fs = require('fs');

const tablesThatNeedLanguageIsoCode = [
    "LemmaDefinition",
    "LocalizedMetadata",
    "MorphemeDefinition",
    "LemmaClassType"
];

function exportSqliteData(sqlite, lc, model){
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

function exportXLIFF(sourceLanguage, targetLanguage, res){
    "use strict";
    const xliff = new Xliff(sourceLanguage, targetLanguage);
    models['Lemma'].findAll({
        where: {
            LanguageIsoCode: sourceLanguage
        },
        include: [
            {
                association: "LemmaDefinition",
                where: {
                    LanguageIsoCode: targetLanguage
                },
                required: false
            }
        ]
    }).then(function(lemmas){
        const file = xliff.newFile("LemmaDefinition");
        for(let i = 0; i < lemmas.length; i++){
            const transUnit = {
                "@": {
                    id: lemmas[i].id
                },
                source: lemmas[i].lemma
            };
            if(lemmas[i].LemmaDefinition !== undefined && lemmas[i].LemmaDefinition.length === 1){
                transUnit.target = {
                    "@": {
                        state: "translated"
                    },
                    "#": lemmas[i].LemmaDefinition[0].text
                };
                transUnit["@"].approved = "yes";
            }
            file.addTransUnit(transUnit);
        }
        xliff.addFile(file);
        const xliffDocument = xliff.render()
            .replace(/'/g, "&apos;");

        console.log(xliffDocument);
        if(targetLanguage === undefined){
            targetLanguage = sourceLanguage;
        }
        res.setHeader('Content-disposition', `attachment; filename=${targetLanguage}.xliff`);
        res.setHeader('Content-type', 'application/xml');
        //res.sendFile(xliffFile);
        res.send(xliffDocument);
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
        exportPromise = exportPromise.then(function(){ return exportSqliteData(sqlite, req.params.lc, table); });
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

router.get('/xliff/:source', function(req, res, next){
    "use strict";
    exportXLIFF(req.params.source, undefined, res);
});

router.get('/xliff/:source/:target', function(req, res, next){
    "use strict";
    exportXLIFF(req.params.source, req.params.target, res);
});

router.get('/dictionary/:id/:type/:lc', function(req, res, next){
    "use strict";
    models.DictionaryBuild.cache.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(dictionaryBuild) {
        const dictionary = new Dictionary(dictionaryBuild.LanguageIsoCode, req.params.lc);
        dictionary.build(dictionaryBuild.id, req.params.type).then(function(data){
            res.setHeader("content-type", "application/pdf");
            const options = {
                cmd: 'xelatex' // This will write the errors to `latexerrors.log`
            };
            const pdf = latex(data, options);

            pdf.pipe(res);
            pdf.on('error', err => console.error(err));
            fs.writeFile(req.params.id + "_" + req.params.lc + ".tex", data, function(err) {
                if(err) {
                    return console.error(err);
                }
                console.log("The file was saved!");
            });
        });
    });

});

module.exports = router;
