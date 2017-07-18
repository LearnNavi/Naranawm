
const format = require('string-format');
const Lemma = require('./lemma');
const EanaEltu = require('./eanaEltu');
const models = require('../models');
const Promise = require('bluebird');

/*
* This Module / Section is to export data from Eana Eltu
* and convert it into a format that we can insert into
* the new database schema                               */

function Dictionary () {
    this.debug = false;
    this.eanaEltu = new EanaEltu();
    this.languages = {
        en: {
            engName: "English",
            nativeName: "English",
            active: 1
        }
    };
    this.activeLanguages = [];
    this.metadata = {};
    this.templates = {};
    this.entryTemplates = {};
    this.lemmas = {};
    this.sources = {};
    this.lemmaClassTypes = {};
    this.missingMetadataTranslations = {};
    this.missingDefinitionTranslations = {};
    this.missingSources = [];

}

Dictionary.prototype.buildDictionary = function (callback) {
    if(this.debug){
        console.log("Building Dictionary...");
    }
    const self = this;
    this.eanaEltu.fetchData(function(rawEEdata){
        self.eanaEltu = rawEEdata;
        buildDictionaryLanguages(self);
        buildActiveLanguages(self);
        buildDictionaryMetadata(self);
        buildDictionaryTemplates(self);
        buildDictionaryLemmas(self);
        if(self.debug){
            console.log("Complete");
        }
        callback();
    });
};

Dictionary.prototype.exportDictionaryBuilds = function () {
    // Insert Dictionary Types
    const self = this;
    const blocks = [   // Copied out of EE perl script
        {
            id: 0,
            description: "Main Block",
            LanguageIsoCode: "nav"
        },{
            id: 1,
            description: "Invalid Words Block",
            LanguageIsoCode: "nav"
        },{
            id: 2,
            description: "Infixes Block",
            LanguageIsoCode: "nav"
        },{
            id: 3,
            description: "Noun Inflections Block",
            LanguageIsoCode: "nav"
        },{
            id: 4,
            description: "Other noun inflections block",
            LanguageIsoCode: "nav"
        },{
            id: 5,
            description: "English Shorthand Terms Block [DEPRECATED]",
            LanguageIsoCode: "nav"
        },{
            id: 6,
            description: "Proper Nouns Block",
            LanguageIsoCode: "nav"
        },{
            id: 7,
            description: "Proper Nouns Block (Flora)",
            LanguageIsoCode: "nav"
        },{
            id: 8,
            description: "Proper Nouns Block (Fauna)",
            LanguageIsoCode: "nav"
        },{
            id: 9,
            description: "Loaned Words Block",
            LanguageIsoCode: "nav"
        },{
            id: 10,
            description: "Phrases Block",
            LanguageIsoCode: "nav"
        },{
            id: 11,
            description: "Derivational Morph Block",
            LanguageIsoCode: "nav"
        }
    ];
    const builds = [];
    const buildData = [];
    for(const type of Object.keys(self.eanaEltu.dictOrder)){
        builds.push({
            id: type,
            description: getDictionaryBuildDescription(type),
            LanguageIsoCode: "nav"
        });
        for(const position of Object.keys(self.eanaEltu.dictOrder[type])){
            const data = self.eanaEltu.dictOrder[type][position];

            if(data.type === "raw"){
                data.data1 = getDictionaryBuildTemplate(data.data1);
            }

            if(data.type === "changelog"){
                data.data1 = "changelog";
            }

            if(data.type === "raw" || data.type === "file" || data.type === "changelog"){
                data.type = "template";
                data.template = data.data1.toLowerCase();
            }

            buildData.push({
                DictionaryBuildId: type,
                DictionaryBlockId: getDictionaryBlockId(data),
                TemplateId: data.template,
                position: data.pos,
                type: data.type,
                data: getDictionaryBuildData(data),
                LanguageIsoCode: "nav"
            });
        }
    }

    return models.DictionaryBuild.bulkCreate(builds).then(function(){
        "use strict";
        return models.DictionaryBlock.bulkCreate(blocks).then(function(){
            return models.DictionaryBuildData.bulkCreate(buildData);
        })
    });
};

Dictionary.prototype.exportLanguages = function (){
    "use strict";
    // Insert Languages
    const self = this;
    const languages = [];
    for(const langId of Object.keys(self.languages)){
        const language = self.languages[langId];
        languages.push({
            isoCode: langId,
            isoName: language.engName,
            nativeName: language.nativeName,
            active: language.active,
            export: language.active
        });
    }

    return models.Language.bulkCreate(languages).then(function() {
        return models.Language.findAll().then(function (languages) {
            languages.forEach(function (language) {
                self.languages[language.isoCode] = language;
            });
        });
    });
};

Dictionary.prototype.exportSources = function(){
    "use strict";
    // Insert Sources
    const self = this;
    const sources = [];
    for(const source of Object.keys(self.sources)){
        sources.push({
            name: source,
            description: getSourceDescription(source),
            LanguageIsoCode: "nav"
        });
    }

    return models.Source.bulkCreate(sources).then(function() {
        return models.Source.findAll().then(function (sources) {
            sources.forEach(function (source) {
                self.sources[source.name] = source;
            });
        });
    });
};

Dictionary.prototype.exportDictionaryTemplates = function () {
    // Insert Templates
    const self = this;
    const templates = [
        {
            id: "localized_end",
            latex: "__END__",
            html: "",
            LanguageIsoCode: "nav"
        }, {
            id: "newpage",
            latex: "\\newpage",
            html: "",
            LanguageIsoCode: "nav"
        }, {
            id: "end_hangparas_multicols",
            latex: "\\end{hangparas}}\\end{multicols}",
            html: "",
            LanguageIsoCode: "nav"
        }, {
            id: "end_hangparas",
            latex: "\\end{hangparas}",
            html: "",
            LanguageIsoCode: "nav"
        }, {
            id: "end_document",
            latex: "\\end{document}",
            html: "",
            LanguageIsoCode: "nav"
        }, {
            id: "end_hangparas_multicols_newpage",
            latex: "\\end{hangparas}}\\end{multicols}+\\newpage",
            html: "",
            LanguageIsoCode: "nav"
        }];

    for(const id of Object.keys(self.eanaEltu.dictLayout)){
        const layout = self.eanaEltu.dictLayout[id];
        if(layout.id === "changelog"){
            layout.value += "\n\\begin{itemize}\n<<CHANGELOG_ITEMS>>\n\\end{itemize}\n\\end{document}";
        }
        if(id === "__PANDORAPEDIA__"){
            continue;
        }
        templates.push({
            id: layout.id.toLowerCase(),
            latex: layout.value,
            html: "",
            LanguageIsoCode: "nav"
        });
    }

    return models.DictionaryTemplate.bulkCreate(templates);
};

Dictionary.prototype.exportEntryTemplates = function () {
    // Insert Templates
    const self = this;
    const templates = [
        {
            id: "PAR",
            latex: "\\par#",
            html: "<p>#</p>"
        }, {
            id: "BOLD",
            latex: "\\textbf{#}",
            html: "<b>#</b>"
        }, {
            id: "IPA",
            latex: "\\textipa{#}",
            html: "#"
        }, {
            id: "SUBSCRIPT",
            latex: "$_{#}$",
            html: "<sub>#</sub>"
        }, {
            id: "TEXT",
            latex: "#",
            html: "#"
        }, {
            id: "ITALIC",
            latex: "\\textit{#}",
            html: "<i>#</i>"
        }, {
            id: "SMALL_CAPS",
            latex: "\\textsc{#}",
            html: "<small>#</small>"
        }];

    return models.EntryTemplate.bulkCreate(templates).then(function(){
        "use strict";
        return models.EntryTemplate.findAll().then(function(entryTemplates){
            entryTemplates.forEach(function(entryTemplate){
                self.entryTemplates[entryTemplate.id] = entryTemplate;
            });
        });
    });
};

Dictionary.prototype.createLayoutWithTemplates = function(layout){
    "use strict";
    const self = this;
    return models.EntryLayout.create(layout).then(function(entryLayout){
        for(let i = 0; i < layout.templates.length; i++) {
            const template = layout.templates[i];
            entryLayout.addEntryTemplate(self.entryTemplates[template.id], {
                through: {
                    position: template.position,
                    field: template.field
                }
            });
        }
        return entryLayout.save().then(function(){
            return self.createLayoutsWithTemplates(layout.children);
        });
    });
};

Dictionary.prototype.createLayoutsWithTemplates = function(layouts) {
    "use strict";
    const self = this;
    return new Promise(function(externalResolve, externalReject){
        const externalPromises = [];
        if(layouts === undefined || layouts.length === 0){
            // Nothing to do... resolve/return
            externalResolve();
            return;
        }
        for(let k = 0; k < layouts.length; k++){
            externalPromises.push(self.createLayoutWithTemplates(layouts[k]));
        }

        Promise.all(externalPromises).then(externalResolve);
    });
};

Dictionary.prototype.createEntryTypeWithMetada = function(entryType, metadata){
    "use strict";
    const self = this;
    return models.EntryType.create(entryType).then(function(newEntryType){
        for(let i = 0; i < metadata.length; i++) {
            newEntryType.addMetadata(self.metadata[metadata[i]]);
        }
        return newEntryType.save();
    });
};

Dictionary.prototype.exportEntryLayouts = function () {
    // Insert Templates
    const self = this;

    const data = [
        {
            id: 'ENTRY',
            layout: '{entry}',
            templates: [
                {
                    id: 'PAR',
                    position: 0,
                    field: 'entry'
                }],
            children: [
                {
                    id: 'IPA_ENTRY',
                    layout: '{lemma}: [{ipa}] {source} {lemma_class} {entry}',
                    ParentId: "ENTRY",
                    templates: [
                        {
                            id: 'BOLD',
                            position: 0,
                            field: 'lemma'
                        },{
                            id: 'IPA',
                            position: 1,
                            field: 'ipa'
                        },{
                            id: 'SUBSCRIPT',
                            position: 2,
                            field: 'source'
                        },{
                            id: 'TEXT',
                            position: 3,
                            field: 'lemma_class'
                        },{
                            id: 'TEXT',
                            position: 4,
                            field: 'entry'
                        }],
                    children: [
                        {
                            id: 'IPA_ENTRY_ITALIC_DEF',
                            layout: '{definition} {entry}',
                            ParentId: 'IPA_ENTRY',
                            templates: [
                                {
                                    id: 'ITALIC',
                                    position: 0,
                                    field: 'definition'
                                },{
                                    id: 'TEXT',
                                    position: 1,
                                    field: 'ENTRY'
                                }]
                        },{
                            id: 'IPA_ENTRY_ITALIC_DEF_PARENS',
                            layout: '{definition} ({entry})',
                            ParentId: "IPA_ENTRY",
                            templates: [
                                {
                                    id: 'ITALIC',
                                    position: 0,
                                    field: 'definition'
                                },{
                                    id: 'TEXT',
                                    position: 1,
                                    field: 'ENTRY'
                                }]
                        },{
                            id: 'IPA_ENTRY_PARENS',
                            layout: '({entry})',
                            ParentId: "IPA_ENTRY",
                            templates: [
                                {
                                    id: 'TEXT',
                                    position: 0,
                                    field: 'ENTRY'
                                }]
                        }
                    ]
                }
            ]
        },{
            id: 'SUB_ENTRY_LEMMA_DEF',
            layout: '{lemma} {definition}',
            templates: [
                {
                    id: 'BOLD',
                    position: 0,
                    field: 'lemma'
                },{
                    id: 'ITALIC',
                    position: 1,
                    field: 'definition'
                }
            ],
            children: []
        }
    ];

    return self.createLayoutsWithTemplates(data).then(function(){
        "use strict";


        const validLayouts = [
            'affixN',
            'alloffixN',
            'cw',
            'cww',
            'derive',
            'derives',
            'derivingaffix',
            'derivingaffixN',
            'infixN',
            'infixcwN',
            'lenite',
            'liu',
            'loan',
            'markerN',
            'note',
            'word'
        ];
        const layouts = [];
        const localizedLayouts = [];
        for(const lang of Object.keys(self.templates)){
            for(const templateId of Object.keys(self.templates[lang])){
                if(validLayouts.indexOf(templateId) !== -1){
                    const template = self.templates[lang][templateId];

                    if(lang === "raw"){
                        layouts.push({
                            id: templateId,
                            layout: template.format,
                            argc: template.argc,
                            changeable: template.changeable,
                            EntryLayoutId: template.parentId,
                            metadata: template.metadata
                        });
                    } else {
                        if(template.format === undefined || template.format === null){
                            template.format = "<< BLANK >>";
                        }
                        localizedLayouts.push({
                            EntryTypeId: templateId,
                            LanguageIsoCode: lang,
                            layout: template.format,
                            argc: template.argc,
                            changeable: template.changeable
                        });
                    }
                }
            }
        }

        const layoutPromises = [];
        for(let i = 0; i < layouts.length; i++){
            layoutPromises.push(self.createEntryTypeWithMetada(layouts[i], layouts[i].metadata));
        }

        return Promise.all(layoutPromises).then(function(){
            return models.LocalizedEntryLayout.bulkCreate(localizedLayouts);
        });

    });
};

Dictionary.prototype.exportMetadata = function () {
    // Insert Metadata (Including New lemmas that we need added for other refactorings elsewhere
    const self = this;
    const metadata = [{
        id: "__STANDARD_IPA_ENTRY_TEMPLATE__"
    }];
    const localizedMetadata = [];
    for(const isoCode of Object.keys(self.languages)){
        localizedMetadata.push({
            LanguageIsoCode: isoCode,
            MetadatumId: "__STANDARD_IPA_ENTRY_TEMPLATE__",
            value: "\\par\\textbf{#LEMMA}: [\\textipa{#IPA}] $_{#SOURCE}$ #PART_OF_SPEECH"
        });
    }

    for(const index of Object.keys(self.metadata)){
        for(const lc of Object.keys(self.metadata[index])){

            if(lc === "en"){
                metadata.push({
                    id: index,
                    createdAt: self.metadata[index][lc].editTime * 1000
                });
            }

            localizedMetadata.push({
                LanguageIsoCode: lc,
                MetadatumId: index,
                value: self.metadata[index][lc].value,
                createdAt: self.metadata[index][lc].editTime * 1000
            });
        }
    }

    return models.Metadata.bulkCreate(metadata).then(function() {
        models.Metadata.findAll().then(function (metadataList) {
            metadataList.forEach(function (metadata) {
                self.metadata[metadata.id] = metadata;
            });
        });
        return models.LocalizedMetadata.bulkCreate(localizedMetadata);
    });
};

Dictionary.prototype.exportLemmaClassTypes = function () {
    // Insert Parts of Speech
    const self = this;
    const classTypes = [];
    for (const classType of Object.keys(self.lemmaClassTypes)) {
        const newClassType = {
            LanguageIsoCode: "nav",
            id: classType,
            name: classType,
            abbreviation: classType,
            description: classType
        };
        for (const lc of Object.keys(self.lemmaClassTypes[classType].localizations)) {
            const lcClassType = self.lemmaClassTypes[classType].localizations[lc];
            if(lcClassType !== null && lcClassType !== undefined && lcClassType !== "null"){
                if(lc !== "nav"){
                    //console.log(classType, lc);
                    classTypes.push({
                        LanguageIsoCode: lc,
                        id: classType,
                        name: lcClassType,
                        abbreviation: lcClassType,
                        description: lcClassType
                    });
                } else {
                    // Overriding with 'nav' values for the master element
                    newClassType.name = lcClassType;
                    newClassType.abbreviation = lcClassType;
                    newClassType.description = lcClassType;
                }
            }
        }
        classTypes.push(newClassType);
    }

    //console.log(classTypes);

    return models.LemmaClassType.bulkCreate(classTypes).then(function(){
        "use strict";
        return models.LemmaClassType.findAll({where: {LanguageIsoCode: "nav"}}).then(function(lemmaClassTypes){
            for(let i = 0; i < lemmaClassTypes.length; i ++){
                self.lemmaClassTypes[lemmaClassTypes[i].id] = lemmaClassTypes[i];
            }
        })
    });
};

Dictionary.prototype.exportLemmas = function () {
    // Insert Entries
    const self = this;
    const lemmas = [];
    const definitions = [];
    for(const id of Object.keys(self.lemmas)){
        const lemma = self.lemmas[id];
        lemmas.push({
            id: lemma.id,
            LanguageIsoCode: "nav",
            pubId: lemma.pubId,
            lemma: lemma.lemma,
            ipa: lemma.ipa,
            //partOfSpeech: entry.partOfSpeech,
            //odd: entry.odd,
            audio: lemma.pubId + ".mp3",
            SourceId: self.sources[lemma.source].id,
            DictionaryBlockId: lemma.block,
            EntryTypeId: lemma.type,
            createdAt: lemma.editTime * 1000
        });

        for(const lc of Object.keys(lemma.definitions)){
            const definition = lemma.definitions[lc];
            definitions.push({
                LemmaId: lemma.id,
                LanguageIsoCode: lc,
                odd: definition.odd,
                createdAt: definition.editTime * 1000
            });

        }
    }
    return models.Lemma.bulkCreate(lemmas).then(function(){
        models.Lemma.findAll().then(function(newLemmas){
            "use strict";
            const promises = [];
            for(let i = 0; i < newLemmas.length; i++){
                const newLemma = newLemmas[i];
                const lemma = self.lemmas[newLemma.id];
                const classTypes = [];
                for(let j = 0; j < lemma.classTypes.length; j++){
                    const classType = lemma.classTypes[j].trim();
                    classTypes.push(self.lemmaClassTypes[classType]);
                }
                newLemma.setLemmaClassTypes(classTypes);
                promises.push(newLemma.save());
            }
            return Promise.all(promises).then(function(){
                return models.Definition.bulkCreate(definitions);
            });
        });
    });
};

Dictionary.prototype.export = function (callback) {
    if(this.debug){
        console.log("Exporting Dictionary to new Database...");
    }
    const self = this;

    // Using force: true to drop all tables first
    models.sequelize.sync({force: true}).then(function() {

        const topLayerPromises = [];
        topLayerPromises.push(self.exportLanguages());
        topLayerPromises.push(self.exportSources());
        topLayerPromises.push(self.exportEntryTemplates());

        Promise.all(topLayerPromises).then(function(){
            "use strict";
            // These need the topLayerPromises to be resolved first, as they require data that they provide
            const secondLayerPromises = [];
            secondLayerPromises.push(self.exportDictionaryTemplates());
            secondLayerPromises.push(self.exportDictionaryBuilds());
            secondLayerPromises.push(self.exportMetadata());
            secondLayerPromises.push(self.exportLemmaClassTypes());

            Promise.all(secondLayerPromises).then(function(){

                const thirdLayerPromises = [];
                thirdLayerPromises.push(self.exportEntryLayouts());

                Promise.all(thirdLayerPromises).then(function(){
                    self.exportLemmas().then(function () {
                        models.EntryType.findAll().then(function(entryTypes) {
                            const promises = [];
                            entryTypes.forEach(function(entryType){
                                promises.push(entryType.getHtml().then(function(html){
                                    console.log(entryType.id, "HTML   ", html);
                                    return entryType.getLatex().then(function(latex){
                                        console.log(entryType.id, "LATEX: ", latex);
                                    });
                                }));
                            });
                            Promise.all(promises).then(callback);
                        });
                    });
                });
            });
        });
    });
};

function getDictionaryBuildTemplate(data){
    "use strict";
    switch(data){
        case "__END__":
            return "localized_end";
        case "\\newpage":
            return "newpage";
        case "\\end{hangparas}}\\end{multicols}":
            return "end_hangparas_multicols";
        case "\\end{hangparas}":
            return "end_hangparas";
        case "\\end{document}":
            return "end_document";
        case "\\end{hangparas}}\\end{multicols}+\\newpage":
            return "end_hangparas_multicols_newpage";
        default:
            console.log(723, data);
            return;
    }
}

function getDictionaryBuildData(data){
    "use strict";
    if(data.type === "mainblock" || data.type === "block"){
        return data.data2;
    } else {
        return data.data1;
    }
    /*
     sub fillFile {
         my ($filename) = @_;
         # Open the file.
         #~ open my $HIN, "tex/$filename" or die "Could not open TeXFile: $filename ($!)";
         #~ my @hlines = <$HIN>;
         #~ close $HIN;
         exists $layout{$filename} or die "Unknown layout '$filename'";
         my @hlines = split /\n/, $layout{$filename};
         for my $hline (@hlines) {
             # Placeholder?
             chomp($hline); chomp($hline);
             $hline = fillWithPlaceholders($hline);
         }

         return join("\n", @hlines);
     }

     sub fillWithPlaceholders {
         my ($line) = @_;
         while ($line =~ /__(_[A-Z_0-9]+_)__/ || $line =~ /__([A-Z_0-9]+)__/) {
             my $id = $1;
             if (!exists $words{$id}) {
                $m->error("Couldn't find value for '$id' ($line).");
             }
             $line =~ s/__${id}__/$words{$id}/g;
             # check
         }

         $line =~ s/% DEFAULT.*//*o;
         return $line;
     }
     */
}

function getDictionaryBlockId(data){
    "use strict";
    if(data.type === "mainblock" || data.type === "block"){
        return data.data1;
    }
}

function getDictionaryBuildDescription(type){
    "use strict";
    switch(type){
        case "NaviDictionary":
            return "Sorted in Na'vi";
        case "DictionaryNavi":
            return "Sorted in English";
        case "NaviCatDictionary":
            return "Sorted by category in Na'vi";
        case "NaviPlainDictionary":
            return "Concise Version (no appendices)";
        default:
            return "";
    }
}

function getSourceDescription(source) {
    let result = source.replace("PF", "Dr. Paul Frommer");
    if(source === "G"){
        result = result.replace("G", "The Avatar Games");
    }
    if(source === "M" || source === "PF, M"){
        result = result.replace("M", "The Movie");
    }
    if(source === "PF, D"){
        result = result.replace(", D", ", Disney");
    }
    if(source === "D"){
        result = result.replace("D", "Disney");
    }
    result = result.replace("JC", "James Cameron");
    result = result.replace("LN", "LearnNavi.org");
    result = result.replace("ASG", "The Survival Guide");
    result = result.replace("PND", "Pandorapedia.com");
    result = result.replace("Prr", "Prrton");
    result = result.replace("CP", "CCH Pounder");
    result = result.replace("LA", "Laz Alonso");
    result = result.replace("RL", "Richard Littauer");
    result = result.replace("SW", "Sigourney Weaver");
    result = result.replace("ZS", "Zoë Saldana");
    result = result.replace("CM", "Carla Meyer");
    result = result.replace("CdS", "Cirque du Soleil");
    //result = result.replace("", "");

    return result;
}

function buildDictionaryLanguages(self) {
    for(let index in self.eanaEltu.dictLanguages){
        const language = self.eanaEltu.dictLanguages[index];
        self.languages[index] = {
            engName: language.engName,
            nativeName: language.nativeName,
            active: language.active
        };

    }
}

function buildActiveLanguages (self) {
    if(self.languages === undefined){
        return [];
    }

    for(let index in self.languages){
        if(self.languages[index].active){
            self.activeLanguages.push(index);
        }
    }
}

function buildDictionaryMetadata(self) {
    for(let index in self.eanaEltu.dictMeta){
        self.metadata[index] = {
            en: {
                value: self.eanaEltu.dictMeta[index].value,
                editTime: self.eanaEltu.dictMeta[index].editTime
            }
        };

        const localization = self.eanaEltu.dictLoc[index];
        for(let lc in localization){
            if(localization[lc].value === '' || localization[lc].value === null || localization[lc].value === undefined){
                if(self.debug){
                    console.log("Missing " + lc + " translation for [" + index + "]");
                }
                if(self.missingMetadataTranslations[lc.toLowerCase()] === undefined){
                    self.missingMetadataTranslations[lc.toLowerCase()] = [];
                }
                self.missingMetadataTranslations[lc.toLowerCase()].push(index);
                localization[lc] = {value: "<< NEEDS TRANSLATED >>"};
            }

            self.metadata[index][lc.toLowerCase()] = {
                value: localization[lc].value,
                editTime: localization[lc].editTime
            };
        }
    }
}

function sourceLocation(type) {
    // Source
    switch(type){
        // Arg 4
        case 'affect':
        case 'affectN':
        case 'affectNN':
        case 'derivingaffix':
        case 'derivingaffixN':
        case 'derivingaffixNN':
        case 'marker':
        case 'markerN':
        case 'markerNN':
            return "#4";

        // Arg 5
        case 'affix':
        case 'affixN':
        case 'affixNN':
        case 'infix':
        case 'infixN':
        case 'infixNN':
        case 'infixcwNN':
        case 'liu':
        case 'pword':
        case 'word':
            return "#5";

        // Arg 6
        case 'alloffix':
        case 'alloffixN':
        case 'alloffixNN':
        case 'alloffixx':
        case 'alloffixxN':
        case 'lenite':
        case 'loan':
            return "#6";

        // Arg 7
        case 'cww':
        case 'derives':
        case 'infixcw':
        case 'infixcwN':
        case 'pderives':
            return "#7";

        // Arg 8
        case 'deriveall':
        case 'infixcww':
        case 'note':
            return "#8";

        // Arg 9
        case 'cw':
        case 'derive':
        case 'infixcwww':
        case 'pcw':
            return "#9";


    }

    return "";
}

function partOfSpeechLocation(type) {
    // Part of Speech
    switch(type){
        // arg 3
        case 'affect':
        case 'affectN':
        case 'affectNN':
        case 'affix':
        case 'affixN':
        case 'affixNN':
        case 'cw':
        case 'cww':
        case 'derive':
        case 'deriveall':
        case 'derives':
        case 'derivingaffix':
        case 'derivingaffixN':
        case 'derivingaffixNN':
        case 'infix':
        case 'infixN':
        case 'infixNN':
        case 'infixcw':
        case 'infixcwN':
        case 'infixcwNN':
        case 'infixcww':
        case 'infixcwww':
        case 'lenite':
        case 'liu':
        case 'loan':
        case 'marker':
        case 'markerN':
        case 'markerNN':
        case 'note':
        case 'pcw':
        case 'pderives':
        case 'pword':
        case 'word':
            return "#3";

        // Arg 4
        case 'alloffix':
        case 'alloffixN':
        case 'alloffixNN':
        case 'alloffixx':
        case 'alloffixxN':
            return "#4";

        // Arg 9
        case 'allofix':
            return "#9";
    }
}

function buildDictionaryTemplates(self) {
    const nonIpaTypes = [
            'infixNN',
            'affectNN',
            'infixcwNN',
            'affixNN',
            'alloffixNN',
            'derivingaffixNN',
            'markerNN',
            'eanaInfix'];
    const validLayouts = [
        'affixN',
        'alloffixN',
        'cw',
        'cww',
        'derive',
        'derives',
        'derivingaffix',
        'derivingaffixN',
        'infixN',
        'infixcwN',
        'lenite',
        'liu',
        'loan',
        'markerN',
        'note',
        'word'
    ];
    // Need to get list of languages
    for(let lcCode in self.languages){
        self.templates[lcCode] = {};
    }
    self.templates['raw'] = {};

    const regex = /__(.*)__/;
    const generic_template = "\\par\\textbf{#LEMMA}: [\\textipa{#IPA}] $_{#SOURCE}$ #PART_OF_SPEECH";

    for(let index in self.eanaEltu.dictWordTemplate){

        // Template Cleanup...
        if(nonIpaTypes.indexOf(index) !== -1 || validLayouts.indexOf(index) === -1){
            // None of these have any lemmas of this type, dropping as they aren't needed...
            continue;
        }

        self.eanaEltu.dictWordTemplate[index].parentId = "IPA_ENTRY";
        let format = self.eanaEltu.dictWordTemplate[index].format;

        format = format.replace("#1", "#LEMMA");
        format = format.replace("#2", "#IPA");
        format = format.replace(sourceLocation(index), "#SOURCE");
        format = format.replace(partOfSpeechLocation(index), "#PART_OF_SPEECH");

        // Removing the Generic IPA style layout from the template (refactoring the template)
        format = format.replace(generic_template, "").trim();

        if(format.indexOf("\\textit{#4} (") !== -1){
            format = format.replace("\\textit{#4} (", "").trim();
            format = format.replace(")", "");
            self.eanaEltu.dictWordTemplate[index].parentId = "IPA_ENTRY_ITALIC_DEF_PARENS";
        }

        if(format.indexOf("\\textit{#4}") !== -1){
            format = format.replace("\\textit{#4}", "").trim();
            self.eanaEltu.dictWordTemplate[index].parentId = "IPA_ENTRY_ITALIC_DEF";
        }

        /*if(format.indexOf("(") !== -1){
            format = format.replace("(", "");
            format = format.replace(")", "");
            self.eanaEltu.dictWordTemplate[index].parentId = "IPA_ENTRY_PARENS";
        }*/

        if(index === "cw" || index === "cww" || index === "loan" || index === "pcw"){
            // These templates have parens in them, strip them out and use the correct parent
            self.eanaEltu.dictWordTemplate[index].parentId += "_PARENS";
        }

        const sub_entry_lemma_def = "{LAYOUTS.SUB_ENTRY_LEMMA_DEF}";

        format = format.replace("\\textbf{#5} \\textit{#6}", sub_entry_lemma_def);
        format = format.replace("\\textbf{#6} \\textit{#7}", sub_entry_lemma_def);
        format = format.replace("\\textbf{#7} \\textit{#8}", sub_entry_lemma_def);

        let layout = format;

        const metadataReferences = [];

        let result;
        while(result = layout.match(regex)){
            layout = layout.replace(result[0], "{METADATA." + result[1] + "}");
            metadataReferences.push(result[1]);
        }

        if(index === "cww" || index === "derives"){
            layout += " " + sub_entry_lemma_def;
        } else if(index === "cw") {
            layout += " " + sub_entry_lemma_def + " {METADATA.CW_AND_TEXT} " + sub_entry_lemma_def;
            metadataReferences.push("CW_AND_TEXT")
        } else if(index === "derive"){
            layout += " " + sub_entry_lemma_def + " {METADATA.DERIVE_AND_TEXT} " + sub_entry_lemma_def;
            metadataReferences.push("DERIVE_AND_TEXT");
        }

        for(let lc in self.languages){
            result = format.match(regex);
            let localizedFormat = format;
            if(result !== null) {
                const meta = self.metadata[result[1]];
                if(meta[lc] === undefined){
                    if(self.languages[lc].active){
                        console.log("MISSING TRANSLATION FOR [" + result[1] + "] in " + lc);
                    }
                    continue;
                }

                let metadata = meta[lc].value;

                metadata = metadata.replace("\\textbf{#5} \\textit{#6}", sub_entry_lemma_def);
                metadata = metadata.replace("\\textbf{#6} \\textit{#7}", sub_entry_lemma_def);
                metadata = metadata.replace("\\textbf{#7} \\textit{#8}", sub_entry_lemma_def);

                if(index === "cw" || index === "cww" || index === "loan" || index === "pcw"){
                    // These templates have parens in them, strip them out and use the correct parent
                    metadata = metadata.replace("(", "");
                    metadata = metadata.replace(")", "");
                }

                metadata = metadata.trim();



                if(metadata === ""){
                    console.log(1129, lc, index, result[1], metadata, meta[lc].value);
                }

                if(index === "cww" || index === "derives"){
                    metadata = metadata.replace(sub_entry_lemma_def, "");

                } else if(index === "cw" || index === "derive"){

                    const firstOpenBraceIndex = metadata.indexOf('{');
                    const firstCloseBraceIndex = metadata.indexOf('} ');
                    const secondOpenBraceIndex = metadata.indexOf('{', firstCloseBraceIndex);
                    const firstMetadataPart = metadata.substring(0, firstOpenBraceIndex);
                    const secondMetadataPart = metadata.substring(firstCloseBraceIndex + 2, secondOpenBraceIndex);
                    //console.log(1142, firstMetadataPart, secondMetadataPart);

                    metadata = firstMetadataPart;
                    //localizedFormat = metadata;
                    let key;
                    if(index === "cw"){
                        key = "CW_AND_TEXT";
                    } else if(index === "derive"){
                        key = "DERIVE_AND_TEXT"
                    }
                    if(self.metadata[key] === undefined){
                        self.metadata[key] = {};
                    }
                    self.metadata[key][lc] = {
                        value: secondMetadataPart
                    };
                }

                localizedFormat = localizedFormat.replace(result[0], metadata);

                meta[lc].value = metadata === "" ? "<< NEEDS TRANSLATED >>" : metadata;
            }





            if(localizedFormat.indexOf(sub_entry_lemma_def) !== -1 && layout.indexOf(sub_entry_lemma_def) === -1) {
                // sub_entry_lemma_def exists in the localized layout but not in the main layout
                // we need to pull this out and move it to the main...

                console.log(1173, index, layout, localizedFormat);

            }

            localizedFormat = localizedFormat.trim();
            localizedFormat = (localizedFormat === "") ? undefined : localizedFormat;

            self.templates[lc][index] = {
                format: localizedFormat,
                argc: self.eanaEltu.dictWordTemplate[index].argc,
                changeable: self.eanaEltu.dictWordTemplate[index].changeable
            };

            if(lc === 'en'){

                layout = layout.trim();
                layout = (layout === "") ? undefined : layout;
                self.templates['raw'][index] = {
                    format: layout,
                    argc: self.eanaEltu.dictWordTemplate[index].argc,
                    changeable: self.eanaEltu.dictWordTemplate[index].changeable,
                    parentId: self.eanaEltu.dictWordTemplate[index].parentId,
                    metadata: metadataReferences
                };
            }
        }
    }
}

function processLemmaClass(self, classType){
    "use strict";
    if(self.lemmaClassTypes[classType.trim()] === undefined){
        self.lemmaClassTypes[classType.trim()] = {
            id: classType.trim(),
            localizations: {}
        };
    }
}

function processLocalizedLemmaClass(self, classType, localizedClassType, lc){
    "use strict";
    if(localizedClassType !== null && localizedClassType !== undefined){
        self.lemmaClassTypes[classType.trim()].localizations[lc] = localizedClassType.trim();
    }
}

function buildDictionaryLemmas(self) {
    for(let id in self.eanaEltu.dictWordMeta){
        const rawLemma = self.eanaEltu.dictWordMeta[id];

        const lemma = new Lemma(rawLemma);
        self.sources[lemma.source] = lemma.source;

        if(lemma.source === "") {
            if(self.debug){
                console.log("Missing Source: " + lemma.lemma, lemma.type, lemma.id);
            }
            self.missingSources.push({id: lemma.id, lemma: lemma.lemma});
        }

        for(const classType of lemma.classTypes){
            processLemmaClass(self, classType);
        }

        for(let lc in self.languages){
            if(self.eanaEltu.dictWordLoc[id] === undefined){
                // No localizations have been added yet...
                // adding an empty object to keep from failing out
                self.eanaEltu.dictWordLoc[id] = {};
            }
            let definition = self.eanaEltu.dictWordLoc[id][lc];

            if (lc === 'en') {
                definition = rawLemma;
            }

            if(definition === undefined){
                if(self.debug){
                    console.log("<" + lemma.lemma + "> Missing [" + lc + "] Localization for " + id);
                }
                if(self.missingDefinitionTranslations[lc] === undefined){
                    self.missingDefinitionTranslations[lc] = [];
                }
                self.missingDefinitionTranslations[lc].push({id: id, lemma: lemma.lemma});

            } else {
                const processedDefinition = lemma.addDefinition(definition, lc);

                if(lemma.block === 0 && processedDefinition.classTypes !== undefined && processedDefinition.classTypes.length > 0){
                    if(processedDefinition.classTypes.length !== lemma.classTypes.length){
                        //console.log(1263, "LENGTH MISMATCH!!!", lemma.id, lemma.classTypes, processedDefinition.classTypes);
                    } else {
                        for(let i = 0; i < processedDefinition.classTypes.length; i++){
                            //console.log(classType, processedDefinition.lc);
                            processLocalizedLemmaClass(self, lemma.classTypes[i], processedDefinition.classTypes[i], processedDefinition.lc);
                        }
                    }
                }
            }
        }

        lemma.finalizeLemma();
        self.lemmas[lemma.id] = lemma;
    }
    const keys = Object.keys(self.lemmaClassTypes);

     for(let j = 0; j < keys.length; j++){
         const types = Object.keys(self.lemmaClassTypes[keys[j]]).sort();
         if(self.debug){
             console.log(1282, keys[j] + " <|> " + types.join(" | "));
         }
     }
}

function processRegexReplace(regex, text, replacementTextStart, replacementTextEnd) {
    let result = text.match(regex);

    while(result !== null){
        text = text.replace(result[0], replacementTextStart + result[1] + replacementTextEnd);
        result = text.match(regex);
    }
    return text;
}

function processTemplate(template) {

    const ipaRegex = /\\textipa\s*\{#(\d*)\}/;
    const boldRegex = /\\textbf\s*\{#(\d*)\}/;
    const italicRegex = /\\textit\s*\{#(\d*)\}/;
    const subscriptRegex = /\$_\{#(\d*)\}\$/;
    const smallCapsRegex = /\{\\sc\s*\#(\d*)\}/;
    const numRegex = /#(\d*)/;
    const parRegex = /\\par(.*)/;

    template = processRegexReplace(ipaRegex, template, "{", "}");
    template = processRegexReplace(boldRegex, template, "<b>{", "}</b>");
    template = processRegexReplace(italicRegex, template, "<i>{", "}</i>");
    template = processRegexReplace(subscriptRegex, template, "<sub>{", "}</sub>");
    // TODO: Change <smallcaps> to something real
    template = processRegexReplace(smallCapsRegex, template, "<smallcaps>{", "}</smallcaps>");
    template = processRegexReplace(numRegex, template, "{", "}");
    template = processRegexReplace(parRegex, template, "<p>", "</p>");

    return template;

}

/*
 Each dictionary entry should have the word in na'vi and the ipa at the top level
 -Under that, each translation should exist in its own field as an object
 odd: primaryLemma.odd,
 type: primaryLemma.type,
 editTime: primaryLemma.editTime,
 block: primaryLemma.block,
 audio: primaryLemma.audio
 */

const dictionary = new Dictionary();

module.exports = dictionary;


