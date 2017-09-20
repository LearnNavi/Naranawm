
const models = require('../models');
const Sqlite_models = require('../models/sqlite');
const debug = require('debug')('Naranawm:Dictionary');
const format = require('string-format');

function Dictionary (sourceLanguage, targetLanguage) {
    "use strict";
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    this.builds = {};
}

Dictionary.prototype.fetchAuxillaryData = function(buildId, type){
    "use strict";
    const self = this;
    return new Promise(function(resolve, reject){
        const promises = [];

        promises.push(models.LocalizedMetadata.cache.findAll({
            where: {
                LanguageIsoCode: self.targetLanguage
            }
        }).then(function(localizedMetadata){

            self.localizedMetadata = localizedMetadata;
        }));

        promises.push(models.DictionaryBuildData.cache.findAll({
            where: {
                DictionaryBuildId: buildId
            },
            include: [
                {
                    association: "DictionaryBlock"
                }, {
                    association: "DictionaryTemplate"
                }
            ],
            order: [['position', 'ASC']]
        }).then(function(dictionaryBuildData){
            if(self.builds[buildId] === undefined){
                self.builds[buildId] = {};
            }
            self.builds[buildId].buildData = dictionaryBuildData;
        }));

        promises.push(models.EntryType.findAll({
            include: [{
                association: "Metadata",
                include: [{
                    association: "LocalizedMetadata",
                    where: {
                        LanguageIsoCode: self.targetLanguage
                    }
                }]
            },{
                association: "EntryTypeLayout",
                include: [{
                    association: "EntryLayout"
                }]
            }]
        }).then(function(entryTypes){
            return new Promise(function(resolve, reject){
                self.entryTypes = {};
                const entryTypePromises = [];
                for(let i = 0; i < entryTypes.length; i++){
                    const entryType = entryTypes[i];
                    for(let j = 0; j < entryTypes[i].Metadata.length; j++){
                        entryType.Metadata[j] = {
                            id: entryType.Metadata[j].id,
                            value: entryType.Metadata[j].get({plain: true}).LocalizedMetadata[0].value
                        };
                    }

                    entryTypePromises.push(entryType.getFormattedLayout(type).then(function(formatString){
                        entryType.layout = formatString;
                    }));
                    for(let j = 0; j < entryType.EntryTypeLayout.length; j++){
                        const entryTypeLayout = entryType.EntryTypeLayout[j];//.get({plain:true});

                        const entryLayoutId = entryTypeLayout.EntryLayout.id;
                        if(entryType.layouts === undefined){
                            entryType.layouts = {};
                        }
                        if(entryType.layouts[type] === undefined){
                            entryType.layouts[type] = {};
                        }
                        if(entryType.layouts[type][entryLayoutId] === undefined){
                            entryType.layouts[type][entryLayoutId] = {};
                        }

                        entryTypePromises.push(entryTypeLayout.EntryLayout.getFormattedLayout(type).then(function(formatString){
                            entryType.layouts[type][entryLayoutId][j] = formatString;
                        }));
                    }


                    self.entryTypes[entryTypes[i].id] = entryType;
                }
                Promise.all(entryTypePromises).then(resolve);
            });
        }));

        Promise.all(promises).then(function(){
            resolve();
        });
    });
};

Dictionary.prototype.build = function(buildId, type) {
    "use strict";
    const self = this;
    return new Promise(function(resolve, reject){
        self.fetchAuxillaryData(buildId, type).then(function(){
            const build = self.builds[buildId];

            const documentParts = new Array(build.buildData.length);
            const documentPromises = [];
            for(let i = 0; i < build.buildData.length; i++){
                const buildData = build.buildData[i];
                switch(buildData.type){
                    case "template":
                        documentParts[i] = buildData.DictionaryTemplate[type];
                        if(buildData.DictionaryTemplate[type][buildData.DictionaryTemplate[type].length - 1] !== "\n") {
                            documentParts[i] += "\n";
                        }
                        break;

                    case "mainblock":
                        documentPromises.push(self.buildBlock(buildData.DictionaryBlock, type).then(function(formattedBlock){
                            //documentParts[i] = "\\needspace{8\\baselineskip}\n";
                            //documentParts[i] += "\\noindent\\textbf{A}\\begin{multicols}{2}{\\begin{hangparas}{.5cm}{1}\\noindent\n";
                            documentParts[i] = formattedBlock;

                            //documentParts[i] += "\\end{hangparas} }\\end{multicols}\n";
                        }));
                        //document += buildData[i].DictionaryBlock
                        break;

                    case "block":
                        documentParts[i] = "\n";
                        break;
                }
            }

            Promise.all(documentPromises).then(function(){
                function nth(n){
                    return ["st","nd","rd"][((n+90)%100-10)%10-1] || "th";
                }

                let document = documentParts.join('');
                for(let i = 0; i < self.localizedMetadata.length; i++){
                    if(self.localizedMetadata[i].MetadatumId === "CHANGELOG"){
                        console.log("CHANGELOG");
                        const changelog = [];
                        const entries = self.localizedMetadata[i].value.split('\n');
                        for(let j = 0; j < entries.length; j++){
                            if(entries[j].trim() !== ""){
                                let entry = entries[j].trim();
                                const parts = entry.split('-');
                                const version = parts[0].trim();
                                entry = entry.replace(parts[0], "");
                                changelog.push(`\\item {\\bf ${version}} ${entry}`);
                            }
                        }
                        console.log(changelog);
                        document = document.replace(new RegExp(`__${self.localizedMetadata[i].MetadatumId}__`, "g"), changelog.join('\n'));
                    } else {
                        document = document.replace(new RegExp(`__${self.localizedMetadata[i].MetadatumId}__`, "g"), self.localizedMetadata[i].value);
                    }

                }
                const date = new Date();
                const locale = "en-us";
                const month = date.toLocaleString(locale, { month: "long" });
                const day = date.getDate();
                const year = date.getFullYear();
                document = document.replace(new RegExp("___DATE___", "g"), `${month} ${day}$^{${nth(day)}}$, ${year}`);
                //console.log("Done", document);
                resolve(document);
            });
        });
    });
};

Dictionary.prototype.buildBlock = function (block, type){
    const self = this;
    return new Promise(function(resolve, reject){
        models.Lemma.cache.findAll({
            where: {
                LanguageIsoCode: self.sourceLanguage,
                DictionaryBlockId: block.id
            },
            include: [
                {
                    association: "LemmaDefinition",
                    where: {
                        LanguageIsoCode: self.targetLanguage
                    }
                }, {
                    association: "Source"
                }, {
                    association: "LemmaClassTypes",
                    through: "LemmaClassTypeAssociations",
                    where: {
                        LanguageIsoCode: self.targetLanguage
                    }
                }, {
                    association: "LinkedLemma",
                    include: [{
                        association: "ReferencesLemma",
                        include: [{
                            association: "LemmaDefinition",
                            where: {
                                LanguageIsoCode: self.targetLanguage
                            }
                        }]
                    }]
                }, {
                    association: "Grapheme"
                }
            ],
            order: [
                [models.Lemma.associations.Grapheme, 'sortOrder', 'ASC'],
                ['lemma', 'ASC']
            ]
        }).then(function(lemmas){
            "use strict";
            console.log("Got Lemmas");
            const definitions = new Array(lemmas.length);
            const promises = [];
            for(let i = 0; i < lemmas.length; i++){
                promises.push(self.getFormattedDefinition(lemmas[i], type).then(function(formattedDefinition){
                    definitions[i] = formattedDefinition;
                    lemmas[i].definition = formattedDefinition;
                }));
            }

            Promise.all(promises).then(function(){
                //resolve();
                if(block.useGraphemeHeaders){
                    const sectionStart = function(header){
                        const processedHeader = header.charAt(0).toUpperCase() + header.slice(1);
                        return `\\needspace{8\\baselineskip}\n\\noindent\\textbf{${processedHeader}}\\begin{multicols}{2}{\\begin{hangparas}{.5cm}{1}\\noindent\n`;
                    };
                    const sectionEnd = function(){
                        return `\\end{hangparas} }\\end{multicols}\n`;
                    };
                    let latexData = "";
                    let currentGrapheme = 0;
                    for(let i = 0; i < lemmas.length; i++){
                        const definition = lemmas[i].definition;

                        // Check for section boundary
                        if(lemmas[i].GraphemeId !== currentGrapheme){
                            if(currentGrapheme > 0){
                                // End current Section
                                latexData += sectionEnd();
                            }
                            // Start new section
                            latexData += sectionStart(lemmas[i].Grapheme.grapheme);
                            currentGrapheme = lemmas[i].GraphemeId;
                        }

                        latexData += definition + '\n';
                    }
                    if(latexData !== ""){
                        latexData += sectionEnd();
                    }
                    resolve(latexData);
                } else {
                    resolve(definitions.join('\n'));
                }
            });
        });


        //block.getFormattedBlock(type, lc).then(function(formattedBlock){
        //    console.log(formattedBlock);
        //    resolve(formattedBlock);
        //});
    });
};

Dictionary.prototype.getFormattedDefinition = function(lemma, type){
    "use strict";
    const self = this;
    return new Promise(function(resolve, reject){
        if(lemma.LemmaDefinition.length === 1){
            // Expected case... assuming we only allow a single definition
            const definition = lemma.LemmaDefinition[0];
            //console.log(definition.text);

            const lemmaClassTypes = [];
            for(let i = 0; i < lemma.LemmaClassTypes.length; i++){
                lemmaClassTypes.push(lemma.LemmaClassTypes[i].abbreviation);
            }


            const localMetadata = {};
            const entryType = self.entryTypes[lemma.EntryTypeId];
            for(let i = 0; i < entryType.Metadata.length; i++){
                localMetadata[entryType.Metadata[i].id] = entryType.Metadata[i].value;
            }

            let layouts = {};
            if(entryType.layouts !== undefined){
                layouts = JSON.parse(JSON.stringify(entryType.layouts[type]));
                if(lemma.id === 133){
                    console.log(lemma.linkedLemma);
                }
                for(let i = 0; i < lemma.LinkedLemma.length; i++){
                    const linkedDef = {
                        lemma: lemma.LinkedLemma[i].ReferencesLemma.lemma,
                        definition: lemma.LinkedLemma[i].ReferencesLemma.LemmaDefinition[0].text
                    };

                    if(linkedDef.definition === null){
                        linkedDef.definition = "";
                    }

                    if(layouts["SUB_ENTRY_LEMMA_DEF"] !== undefined && layouts["SUB_ENTRY_LEMMA_DEF"][i] !== undefined){
                        layouts["SUB_ENTRY_LEMMA_DEF"][i] = format(layouts["SUB_ENTRY_LEMMA_DEF"][i], linkedDef);
                    }

                    if(layouts["SUB_ENTRY_LEMMA"] !== undefined && layouts["SUB_ENTRY_LEMMA"][i] !== undefined){
                        layouts["SUB_ENTRY_LEMMA"][i] = format(layouts["SUB_ENTRY_LEMMA"][i], linkedDef);
                    }

                }
            }

            const formatData = {
                lemma: lemma.lemma,
                ipa: lemma.ipa,
                source: lemma.Source.name,
                lemma_class: lemmaClassTypes.join(", "),
                definition: definition.text,
                note: definition.note,
                METADATA: localMetadata,
                LAYOUTS: layouts
            };
            if(entryType.id === "lenite"){
                console.log(formatData, entryType.layout);
            }
            resolve(format(entryType.layout, formatData));

        } else {
            console.log("Missing Definition!", lemma.id);
            resolve();
        }
    });
};

module.exports = Dictionary;