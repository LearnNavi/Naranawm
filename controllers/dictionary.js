
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
                    case "block":
                        console.log(buildData.DictionaryBlock.id);
                        documentPromises.push(self.buildBlock(buildData.DictionaryBlock, type).then(function(formattedBlock){
                            //documentParts[i] = "\\needspace{8\\baselineskip}\n";
                            //documentParts[i] += "\\noindent\\textbf{A}\\begin{multicols}{2}{\\begin{hangparas}{.5cm}{1}\\noindent\n";
                            documentParts[i] = formattedBlock;

                            //documentParts[i] += "\\end{hangparas} }\\end{multicols}\n";
                        }));
                        //document += buildData[i].DictionaryBlock
                        break;

                    default:
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
                document = document.replace(new RegExp("»", "g"), "\u00BB");
                //document = document.replace(new RegExp("#", "g"), "X");
                console.log("Done");
                resolve(document);
            });
        });
    });
};

function alpha(alphabet, dir, caseSensitive){
    dir = dir || 1;
    function compareLetters(a, b) {
        let ia = alphabet.indexOf(a);
        let ib = alphabet.indexOf(b);
        if(ia === -1 || ib === -1) {
            if(ib !== -1)
                return a > 'a';
            if(ia !== -1)
                return 'a' > b;
            return a > b;
        }
        return ia > ib;
    }
    return function(a, b){
        let pos = 0;
        let min = Math.min(a.length, b.length);
        caseSensitive = caseSensitive || false;
        if(!caseSensitive){
            a = a.toLowerCase();
            b = b.toLowerCase();
        }
        while(a.charAt(pos) === b.charAt(pos) && pos < min){ pos++; }
        return compareLetters(a.charAt(pos), b.charAt(pos)) ? dir:-dir;
    };
}

Dictionary.prototype.buildBlock = function (block, type){
    const self = this;
    const naviAlphabet = alpha("'aäbcdefghiìjklmnopqrstuvwxyz ");
    return new Promise(function(resolve, reject){
        let sortOrder = [
            [models.Lemma.associations.Grapheme, 'sortOrder', 'ASC'],
            ['lemma', 'ASC']
            //[models.sequelize.fn('lower', models.sequelize.col('Lemma.lemma')), 'ASC']
        ];
        if(block.id !== 0){
            sortOrder = [
                //[models.Lemma.associations.Grapheme, 'sortOrder', 'ASC'],
                //['lemma', 'ASC']
                [models.sequelize.fn('lower', models.sequelize.col('Lemma.lemma')), 'ASC']
            ];
        }
        models.Lemma.findAll({
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
                    },
                    required: false
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
                    }],
                    required: false
                }, {
                    association: "Grapheme",
                    required: false
                }
            ],
            sort: sortOrder
        }).then(function(unsortedLemmas){
            "use strict";
            // Sort lemmas
            let lemmas = unsortedLemmas.sort(function(l1, l2) {
                if(l1.Grapheme !== undefined && l1.Grapheme !== null && l2.Grapheme !== undefined && l2.Grapheme !== null){
                    if(l1.Grapheme.sortOrder !== l2.Grapheme.sortOrder){
                        if(l1.Grapheme.sortOrder < l2.Grapheme.sortOrder){
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                }

                return naviAlphabet(l1.lemma, l2.lemma);

            });
            console.log(229, "Got Lemmas", block.id, lemmas.length);
            const definitions = new Array(lemmas.length);
            const promises = [];
            for(let i = 0; i < lemmas.length; i++){
                if(lemmas[i].id === 1725){
                    console.log("FOUND LEMMA");
                }
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
                            if(lemmas[i].Grapheme === null){
                                console.log(lemmas[i].id, lemmas[i].lemma, lemmas[i].DictionaryBlockId, block.useGraphemeHeaders, block.id);
                            }
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
                    console.log(133, lemma.linkedLemma);
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

            let rawIpa = lemma.ipa;

            if(type === "latex"){
                // Convert IPA UTF-8 to LaTeX

                rawIpa = rawIpa.replace(/_/g, "$\\_$");
                rawIpa = rawIpa.replace(/\u02C8/g, "\\textprimstress ");
                rawIpa = rawIpa.replace(/\u02CC/g, "\\textsecstress ");
                rawIpa = rawIpa.replace(/\u031A/g, "\\textcorner ");
                //rawIpa = rawIpa.replace(/(\\ )/g, rawIpa, " ");
                rawIpa = rawIpa.replace(/\u025B/g, "E");
                rawIpa = rawIpa.replace(/\u0294/g, "P");
                rawIpa = rawIpa.replace(/\u029D/g, "J");
                rawIpa = rawIpa.replace(/\u027E/g, "R");
                rawIpa = rawIpa.replace(/\u0271/g, "M");
                rawIpa = rawIpa.replace(/\u014B/g, "N");
                rawIpa = rawIpa.replace(/\u026A/g, "I");
                rawIpa = rawIpa.replace(/\u0292/g, "Z");
                rawIpa = rawIpa.replace(/t\u0361s/g, "\\t\{ts\}");
                rawIpa = rawIpa.replace(/l\u0329/g, "\\textsyllabic{l}");
                rawIpa = rawIpa.replace(/r\u0329/g, "\\textsyllabic{r}");
                rawIpa = rawIpa.replace(/\u22C5/g, "$\\cdot$");
                // Illegal phonetics for Na'vi - bug in EE data
                //rawIpa = rawIpa.replace(/(\\textsyllabic{ts})/, rawIpa, "\u02A6\u0329");
                //rawIpa = rawIpa.replace(/(\\textesh )/, rawIpa, "\u0283");
                //rawIpa = rawIpa.replace(/(\\textesh)/, rawIpa, "\u0283");
                //
                //rawIpa = rawIpa.replace(/(\$\\_\$)/, rawIpa, "_");
                lemma.ipa = rawIpa;
            }

            const formatData = {
                lemma: lemma.lemma,
                ipa: lemma.ipa,
                source: lemma.Source.name,
                lemma_class: lemmaClassTypes.sort().join(", "),
                definition: definition.text,
                loanWordLanguage: definition.loanWordLanguage,
                loanWordDefinition: definition.loanWordDefinition,
                note: definition.note,
                METADATA: localMetadata,
                LAYOUTS: layouts
            };
            if(entryType.id === "lenite"){
                //console.log("lenite", formatData, entryType.layout);
            }
            resolve(format(entryType.layout, formatData));

        } else {
            console.log(351, "Missing Definition!", lemma.id);
            resolve();
        }
    });
};

module.exports = Dictionary;