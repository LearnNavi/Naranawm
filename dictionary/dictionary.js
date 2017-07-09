
var format = require('string-format');
var Entry = require('./entry');
var EanaEltu = require('./eanaEltu');
var models = require('../models');
var Promise = require('bluebird');

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

Dictionary.prototype.export = function (callback) {
    if(this.debug){
        console.log("Exporting Dictionary to new Database...");
    }
    var self = this;

    // Using force: true to drop all tables first
    models.sequelize.sync({force: true}).then(function() {

        // Insert Languages
        var languages = [];
        for(var langId in self.languages){
            var language = self.languages[langId];
            languages.push({
                isoCode: langId,
                isoName: language.engName,
                nativeName: language.nativeName,
                active: language.active
            });
        }

        models.Language.bulkCreate(languages).then(function(){
            models.Language.findAll().then(function(languages){

                languages.forEach(function(language){
                    self.languages[language.isoCode] = language;
                });

                // Insert Sources
                var sources = [];
                for(var source in self.sources){
                    sources.push({
                        name: source,
                        description: getSourceDescription(source)
                    });
                }

                models.Source.bulkCreate(sources).then(function(){
                    models.Source.findAll().then(function(sources) {

                        sources.forEach(function (source) {
                            self.sources[source.name] = source;
                        });

                        // Insert Metadata (Including New entries that we need added for other refactorings elsewhere
                        var metadata = [{
                            id: "__STANDARD_IPA_ENTRY_TEMPLATE__"
                        }];
                        var localizedMetadata = [];
                        for(var isoCode in self.languages){
                            localizedMetadata.push({
                                LanguageIsoCode: isoCode,
                                MetadatumId: "__STANDARD_IPA_ENTRY_TEMPLATE__",
                                value: "\\par\\textbf{#LEMMA}: [\\textipa{#IPA}] $_{#SOURCE}$ #PART_OF_SPEECH"
                            })
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

                        models.Metadata.bulkCreate(metadata).then(function(){
                            models.LocalizedMetadata.bulkCreate(localizedMetadata).then(function(){

                                // Insert Parts of Speech
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

                                models.PartOfSpeech.bulkCreate(partsOfSpeech).then(function(){

                                    // Insert Templates
                                    var templates = [];
                                    var localizedTemplates = [];
                                    for(var lang in self.templates){
                                        for(var templateId in self.templates[lang]){
                                            var template = self.templates[lang][templateId];

                                            if(lang === "raw"){
                                                templates.push({
                                                    id: templateId,
                                                    format: template.format,
                                                    argc: template.argc,
                                                    changeable: template.changeable
                                                });
                                            } else {
                                                localizedTemplates.push({
                                                    TemplateId: templateId,
                                                    LanguageIsoCode: lang,
                                                    format: template.format,
                                                    argc: template.argc,
                                                    changeable: template.changeable
                                                });
                                            }

                                        }
                                    }

                                    models.Template.bulkCreate(templates).then(function(){
                                        models.LocalizedTemplate.bulkCreate(localizedTemplates).then(function () {
                                            // Insert Entries
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
                                            models.Entry.bulkCreate(entries).then(function(){
                                                models.LocalizedEntry.bulkCreate(localizedEntries).then(callback);
                                            }).catch(function(err){
                                                console.log(122,err);
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
};

function getSourceDescription(source) {
    var result = source.replace("PF", "Dr. Paul Frommer");
    if(source === "G"){
        result = result.replace("G", "The Avatar Games");
    }
    if(source === "M" || source === "PF, M"){
        result = result.replace("M", "The Movie");
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
    // Need to get list of languages
    for(var i = 0; i < self.activeLanguages.length; i++){
        self.templates[self.activeLanguages[i]] = {};
    }
    self.templates['raw'] = {};

    var regex = /__(.*)__/;
    var generic_template = "\\par\\textbf{#LEMMA}: [\\textipa{#IPA}] $_{#SOURCE}$ #PART_OF_SPEECH";

    for(var index in self.eanaEltu.dictWordTemplate){

        // Template Cleanup...
        if(nonIpaTypes.indexOf(index) !== -1){
            // None of these have any entries of this type, dropping as they aren't needed...
            continue;
        }

        var format = self.eanaEltu.dictWordTemplate[index].format;
        format = format.replace("#1", "#LEMMA");
        format = format.replace("#2", "#IPA");
        format = format.replace(sourceLocation(index), "#SOURCE");
        format = format.replace(partOfSpeechLocation(index), "#PART_OF_SPEECH");

        self.templates['raw'][index] = {
            format: format.replace(generic_template, "__STANDARD_IPA_ENTRY_TEMPLATE__"),
            argc: self.eanaEltu.dictWordTemplate[index].argc,
            changeable: self.eanaEltu.dictWordTemplate[index].changeable
        };

        for(var j = 0; j < self.activeLanguages.length; j++){
            var result = format.match(regex);
            var localizedFormat = format;
            if(result !== null) {
                var meta = self.metadata[result[1]];
                if(meta[self.activeLanguages[j]] === undefined){
                    console.log("MISSING TRANSLATION FOR [" + result[1] + "] in " + self.activeLanguages[j]);
                    continue;
                }
                localizedFormat = localizedFormat.replace(result[0], meta[self.activeLanguages[j]].value);
            }

            //format = processTemplate(format);
            self.templates[self.activeLanguages[j]][index] = {
                format: localizedFormat.replace(generic_template, "__STANDARD_IPA_ENTRY_TEMPLATE__"),
                argc: self.eanaEltu.dictWordTemplate[index].argc,
                changeable: self.eanaEltu.dictWordTemplate[index].changeable
            };
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


