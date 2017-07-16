
var format = require('string-format');
var Entry = require('./entry');
var EanaEltu = require('./eanaEltu');
var models = require('../models');
var Promise = require('bluebird');

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
    this.entries = {};
    this.sources = {};
    this.partsOfSpeech = {};
    this.missingMetadataTranslations = {};
    this.missingEntryTranslations = {};
    this.missingSources = [];

}

Dictionary.prototype.buildDictionary = function (callback) {
    if(this.debug){
        console.log("Building Dictionary...");
    }
    var self = this;
    this.eanaEltu.fetchData(function(rawEEdata){
        self.eanaEltu = rawEEdata;
        buildDictionaryLanguages(self);
        buildActiveLanguages(self);
        buildDictionaryMetadata(self);
        buildDictionaryTemplates(self);
        buildDictionaryEntries(self);
        if(self.debug){
            console.log("Complete");
        }
        callback();
    });
};

Dictionary.prototype.exportDictionaryBuilds = function () {
    // Insert Dictionary Types
    var self = this;
    var blocks = [   // Copied out of EE perl script
        {
            id: 0,
            description: "Main Block"
        },{
            id: 1,
            description: "Invalid Words Block"
        },{
            id: 2,
            description: "Infixes Block"
        },{
            id: 3,
            description: "Noun Inflections Block"
        },{
            id: 4,
            description: "Other noun inflections block"
        },{
            id: 5,
            description: "English Shorthand Terms Block [DEPRECATED]"
        },{
            id: 6,
            description: "Proper Nouns Block"
        },{
            id: 7,
            description: "Proper Nouns Block (Flora)"
        },{
            id: 8,
            description: "Proper Nouns Block (Fauna)"
        },{
            id: 9,
            description: "Loaned Words Block"
        },{
            id: 10,
            description: "Phrases Block"
        },{
            id: 11,
            description: "Derivational Morph Block"
        }
    ];
    var builds = [];
    var buildData = [];
    for(var type in self.eanaEltu.dictOrder){
        builds.push({
            id: type,
            description: getDictionaryBuildDescription(type)
        });
        for(var position in self.eanaEltu.dictOrder[type]){
            var data = self.eanaEltu.dictOrder[type][position];

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
                data: getDictionaryBuildData(data)
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
    var self = this;
    var languages = [];
    for(var langId in self.languages){
        var language = self.languages[langId];
        languages.push({
            isoCode: langId,
            isoName: language.engName,
            nativeName: language.nativeName,
            active: language.active,
            export: language.active
        });
    }

    return models.Language.bulkCreate(languages).then(function() {
        models.Language.findAll().then(function (languages) {
            languages.forEach(function (language) {
                self.languages[language.isoCode] = language;
            });
        });
    });
};

Dictionary.prototype.exportSources = function(){
    "use strict";
    // Insert Sources
    var self = this;
    var sources = [];
    for(var source in self.sources){
        sources.push({
            name: source,
            description: getSourceDescription(source)
        });
    }

    return models.Source.bulkCreate(sources).then(function() {
        models.Source.findAll().then(function (sources) {
            sources.forEach(function (source) {
                self.sources[source.name] = source;
            });
        });
    });
};

Dictionary.prototype.exportDictionaryTemplates = function () {
    // Insert Templates
    var self = this;
    var templates = [
        {
            id: "localized_end",
            latex: "__END__"
        }, {
            id: "newpage",
            latex: "\\newpage"
        }, {
            id: "end_hangparas_multicols",
            latex: "\\end{hangparas}}\\end{multicols}"
        }, {
            id: "end_hangparas",
            latex: "\\end{hangparas}"
        }, {
            id: "end_document",
            latex: "\\end{document}"
        }, {
            id: "end_hangparas_multicols_newpage",
            latex: "\\end{hangparas}}\\end{multicols}+\\newpage"
        }];

    for(var id in self.eanaEltu.dictLayout){
        var layout = self.eanaEltu.dictLayout[id];
        if(layout.id === "changelog"){
            layout.value += "\n\\begin{itemize}\n<<CHANGELOG_ITEMS>>\n\\end{itemize}\n\\end{document}";
        }
        if(id === "__PANDORAPEDIA__"){
            continue;
        }
        templates.push({
            id: layout.id.toLowerCase(),
            latex: layout.value
        });
    }

    return models.DictionaryTemplate.bulkCreate(templates);
};

Dictionary.prototype.exportEntryTemplates = function () {
    // Insert Templates
    var self = this;
    var templates = [
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
    var self = this;
    return models.EntryLayout.create(layout).then(function(entryLayout){
        for(var i = 0; i < layout.templates.length; i++) {
            var template = layout.templates[i];
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
    var self = this;
    return new Promise(function(externalResolve, externalReject){
        var externalPromises = [];
        if(layouts === undefined || layouts.length === 0){
            // Nothing to do... resolve/return
            externalResolve();
            return;
        }
        for(var k = 0; k < layouts.length; k++){
            externalPromises.push(self.createLayoutWithTemplates(layouts[k]));
        }

        Promise.all(externalPromises).then(externalResolve);
    });
};

Dictionary.prototype.exportEntryLayouts = function () {
    // Insert Templates
    var self = this;

    var data = [
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
                    layout: '{lemma}: [{ipa}] {source} {partOfSpeech} {entry}',
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
                            field: 'partOfSpeech'
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


        var validLayouts = [
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
        var layouts = [];
        var localizedLayouts = [];
        for(var lang in self.templates){
            for(var templateId in self.templates[lang]){
                if(validLayouts.indexOf(templateId) !== -1){
                    var template = self.templates[lang][templateId];

                    if(lang === "raw"){
                        layouts.push({
                            id: templateId,
                            layout: template.format,
                            argc: template.argc,
                            changeable: template.changeable,
                            EntryLayoutId: template.parentId
                        });
                    } else {
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

        return models.EntryType.bulkCreate(layouts).then(function() {
            return models.LocalizedEntryLayout.bulkCreate(localizedLayouts);
        });
    });
};

Dictionary.prototype.exportMetadata = function () {
    // Insert Metadata (Including New entries that we need added for other refactorings elsewhere
    var self = this;
    var metadata = [{
        id: "__STANDARD_IPA_ENTRY_TEMPLATE__"
    }];
    var localizedMetadata = [];
    for(var isoCode in self.languages){
        localizedMetadata.push({
            LanguageIsoCode: isoCode,
            MetadatumId: "__STANDARD_IPA_ENTRY_TEMPLATE__",
            value: "\\par\\textbf{#LEMMA}: [\\textipa{#IPA}] $_{#SOURCE}$ #PART_OF_SPEECH"
        });
    }

    for(var index in self.metadata){
        for(var lc in self.metadata[index]){

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
        return models.LocalizedMetadata.bulkCreate(localizedMetadata);
    });
};

Dictionary.prototype.exportPartsOfSpeech = function () {
    // Insert Parts of Speech
    var self = this;
    var partsOfSpeech = [];
    for (var langId in self.partsOfSpeech) {
        for (var pos in self.partsOfSpeech[langId]) {
            if (pos === "") {
                continue;
            }
            partsOfSpeech.push({
                LanguageIsoCode: langId,
                type: pos
            });
        }
    }

    return models.PartOfSpeech.bulkCreate(partsOfSpeech);
};

Dictionary.prototype.exportEntries = function () {
    // Insert Entries
    var self = this;
    var entries = [];
    var localizedEntries = [];
    for(var id in self.entries){
        var entry = self.entries[id];
        entries.push({
            id: entry.id,
            pubId: entry.pubId,
            lemma: entry.lemma,
            ipa: entry.ipa,
            //partOfSpeech: entry.partOfSpeech,
            //odd: entry.odd,
            audio: entry.pubId + ".mp3",
            SourceId: self.sources[entry.source].id,
            DictionaryBlockId: entry.block,
            EntryTypeId: entry.type,
            createdAt: entry.editTime * 1000
        });

        for(var lc in entry.localizations){
            var localizedEntry = entry.localizations[lc];
            localizedEntries.push({
                EntryId: entry.id,
                LanguageIsoCode: lc,
                odd: localizedEntry.odd,
                createdAt: localizedEntry.editTime * 1000
            });

        }
    }
    return models.Entry.bulkCreate(entries).then(function(){
        return models.LocalizedEntry.bulkCreate(localizedEntries);
    });
};

Dictionary.prototype.export = function (callback) {
    if(this.debug){
        console.log("Exporting Dictionary to new Database...");
    }
    var self = this;

    // Using force: true to drop all tables first
    models.sequelize.sync({force: true}).then(function() {

        var topLayerPromises = [];
        topLayerPromises.push(self.exportLanguages());
        topLayerPromises.push(self.exportSources());
        topLayerPromises.push(self.exportDictionaryTemplates());
        topLayerPromises.push(self.exportEntryTemplates());

        Promise.all(topLayerPromises).then(function(){
            "use strict";
            // These need the topLayerPromises to be resolved first, as they require data that they provide
            var secondLayerPromises = [];
            secondLayerPromises.push(self.exportDictionaryBuilds());
            secondLayerPromises.push(self.exportMetadata());
            secondLayerPromises.push(self.exportEntryLayouts());
            secondLayerPromises.push(self.exportPartsOfSpeech());

            Promise.all(secondLayerPromises).then(function(){
                self.exportEntries().then(function () {
                    models.EntryType.findAll().then(function(entryTypes) {
                        var promises = [];
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
            console.log(data);
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
    var result = source.replace("PF", "Dr. Paul Frommer");
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
    for(var index in self.eanaEltu.dictLanguages){
        var language = self.eanaEltu.dictLanguages[index];
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

    for(var index in self.languages){
        if(self.languages[index].active){
            self.activeLanguages.push(index);
        }
    }
}

function buildDictionaryMetadata(self) {
    for(var index in self.eanaEltu.dictMeta){
        self.metadata[index] = {
            en: {
                value: self.eanaEltu.dictMeta[index].value,
                editTime: self.eanaEltu.dictMeta[index].editTime
            }
        };
        var localization = self.eanaEltu.dictLoc[index];
        for(var lc in localization){
            if(localization[lc].value === ''){
                if(self.debug){
                    console.log("Missing " + lc + " translation for [" + index + "]");
                }
                if(self.missingMetadataTranslations[lc.toLowerCase()] === undefined){
                    self.missingMetadataTranslations[lc.toLowerCase()] = [];
                }
                self.missingMetadataTranslations[lc.toLowerCase()].push(index);
            } else {
                self.metadata[index][lc.toLowerCase()] = {
                    value: localization[lc].value,
                    editTime: localization[lc].editTime
                };
            }
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

    return;
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
    var validLayouts = [
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
    for(var lcCode in self.languages){
        self.templates[lcCode] = {};
    }
    self.templates['raw'] = {};

    var regex = /__(.*)__/;
    var generic_template = "\\par\\textbf{#LEMMA}: [\\textipa{#IPA}] $_{#SOURCE}$ #PART_OF_SPEECH";

    for(var index in self.eanaEltu.dictWordTemplate){

        // Template Cleanup...
        if(nonIpaTypes.indexOf(index) !== -1 || validLayouts.indexOf(index) === -1){
            // None of these have any entries of this type, dropping as they aren't needed...
            continue;
        }

        self.eanaEltu.dictWordTemplate[index].parentId = "IPA_ENTRY";
        var format = self.eanaEltu.dictWordTemplate[index].format;

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

        var sub_entry_lemma_def = "{LAYOUTS.SUB_ENTRY_LEMMA_DEF}";

        format = format.replace("\\textbf{#5} \\textit{#6}", sub_entry_lemma_def);
        format = format.replace("\\textbf{#6} \\textit{#7}", sub_entry_lemma_def);
        format = format.replace("\\textbf{#7} \\textit{#8}", sub_entry_lemma_def);

        var layout = format;
        var result;
        while(result = layout.match(regex)){
            layout = layout.replace(result[0], "{METADATA." + result[1] + "}");
        }

        if(index === "cww" || index === "derives"){
            layout += " " + sub_entry_lemma_def;
        } else if(index === "cw") {
            layout += " " + sub_entry_lemma_def + " {METADATA.CW_AND_TEXT} " + sub_entry_lemma_def;
        } else if(index === "derive"){
            layout += " " + sub_entry_lemma_def + " {METADATA.DERIVE_AND_TEXT} " + sub_entry_lemma_def;
        }

        for(var lc in self.languages){
            result = format.match(regex);
            var localizedFormat = format;
            if(result !== null) {
                var meta = self.metadata[result[1]];
                if(meta[lc] === undefined){
                    if(self.languages[lc].active){
                        console.log("MISSING TRANSLATION FOR [" + result[1] + "] in " + lc);
                    }
                    continue;
                }

                var metadata = meta[lc].value;

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
                    console.log(lc, index, result[1], metadata, meta[lc].value);
                }

                if(index === "cww" || index === "derives"){
                    metadata = metadata.replace(sub_entry_lemma_def, "");

                } else if(index === "cw" || index === "derive"){

                    var firstOpenBraceIndex = metadata.indexOf('{');
                    var firstCloseBraceIndex = metadata.indexOf('} ');
                    var secondOpenBraceIndex = metadata.indexOf('{', firstCloseBraceIndex);
                    var firstMetadataPart = metadata.substring(0, firstOpenBraceIndex);
                    var secondMetadataPart = metadata.substring(firstCloseBraceIndex + 2, secondOpenBraceIndex);
                    console.log(firstMetadataPart, secondMetadataPart);

                    metadata = firstMetadataPart;
                    //localizedFormat = metadata;
                    if(self.metadata[result[1] + "_AND"] === undefined){
                        self.metadata[result[1] + "_AND"] = {};
                    }
                    self.metadata[result[1] + "_AND"][lc] = {
                        value: secondMetadataPart
                    };
                }

                localizedFormat = localizedFormat.replace(result[0], metadata);

                meta[lc].value = metadata === "" ? undefined : metadata;
            }





            if(localizedFormat.indexOf(sub_entry_lemma_def) !== -1 && layout.indexOf(sub_entry_lemma_def) === -1) {
                // sub_entry_lemma_def exists in the localized layout but not in the main layout
                // we need to pull this out and move it to the main...

                console.log(index, layout, localizedFormat);

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
                    parentId: self.eanaEltu.dictWordTemplate[index].parentId
                };
            }
        }
    }
}

function buildDictionaryEntries(self) {
    for(var id in self.eanaEltu.dictWordMeta){
        var rawEntry = self.eanaEltu.dictWordMeta[id];

        var entry = new Entry(rawEntry);
        self.sources[entry.source] = entry.source;

        if(entry.source === "") {
            if(self.debug){
                console.log("Missing Source: " + entry.lemma, entry.type, entry.id);
            }
            self.missingSources.push({id: entry.id, lemma: entry.lemma});
        }

        for(var lc in self.languages){
            if(self.eanaEltu.dictWordLoc[id] === undefined){
                // No localizations have been added yet...
                // adding an empty object to keep from failing out
                self.eanaEltu.dictWordLoc[id] = {};
            }
            var localizedEntry = self.eanaEltu.dictWordLoc[id][lc];

            if (lc === 'en') {
                localizedEntry = rawEntry;
            }

            if(localizedEntry === undefined){
                if(self.debug){
                    console.log("<" + entry.lemma + "> Missing [" + lc + "] Localization for " + id);
                }
                if(self.missingEntryTranslations[lc] === undefined){
                    self.missingEntryTranslations[lc] = [];
                }
                self.missingEntryTranslations[lc].push({id: id, lemma: entry.lemma});

            } else {
                var processedLocalizedEntry = entry.addLocalization(localizedEntry, lc);

                if(entry.block === 0){
                    if(self.partsOfSpeech[processedLocalizedEntry.lc] === undefined){
                        self.partsOfSpeech[processedLocalizedEntry.lc] = {};
                    }
                    if(self.partsOfSpeech[processedLocalizedEntry.lc][processedLocalizedEntry.partOfSpeech] === undefined){
                        self.partsOfSpeech[processedLocalizedEntry.lc][processedLocalizedEntry.partOfSpeech] = {};

                    }
                    self.partsOfSpeech[processedLocalizedEntry.lc][processedLocalizedEntry.partOfSpeech][entry.type] = entry.block;
                }
            }
        }

        entry.finalizeEntry();
        self.entries[entry.id] = entry;
    }
    var keys = Object.keys(self.partsOfSpeech);

     for(var j = 0; j < keys.length; j++){
     var types = Object.keys(self.partsOfSpeech[keys[j]]).sort();
         if(self.debug){
             console.log(keys[j] + " <|> " + types.join(" | "));
         }
     }
}

function processRegexReplace(regex, text, replacementTextStart, replacementTextEnd) {
    var result = text.match(regex);

    while(result !== null){
        text = text.replace(result[0], replacementTextStart + result[1] + replacementTextEnd);
        result = text.match(regex);
    }
    return text;
}

function processTemplate(template) {

    var ipaRegex = /\\textipa\s*\{#(\d*)\}/;
    var boldRegex = /\\textbf\s*\{#(\d*)\}/;
    var italicRegex = /\\textit\s*\{#(\d*)\}/;
    var subscriptRegex = /\$_\{#(\d*)\}\$/;
    var smallCapsRegex = /\{\\sc\s*\#(\d*)\}/;
    var numRegex = /#(\d*)/;
    var parRegex = /\\par(.*)/;

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
 odd: primaryEntry.odd,
 type: primaryEntry.type,
 editTime: primaryEntry.editTime,
 block: primaryEntry.block,
 audio: primaryEntry.audio
 */

var dictionary = new Dictionary();

module.exports = dictionary;


