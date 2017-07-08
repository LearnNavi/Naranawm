
var format = require('string-format');
var Entry = require('./entry');
var EanaEltu = require('./eanaEltu');
var models = require('../models');
var Promise = require('promise');

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
    var sourcePromises = [];
    var entryPromises = [];

    // Using force: true to drop all tables first
    models.sequelize.sync({force: true}).then(function() {

        // Insert Sources
        for(var source in self.sources){
            sourcePromises.push(models.Source.create({
                name: source,
                description: getSourceDescription(source)
            }));
        }

        Promise.all(sourcePromises).then(function(){
            models.Source.findAll().then(function(sources){

                sources.forEach(function(source){
                    self.sources[source.name] = source;
                });

                // Insert Entries
                for(var id in self.entries){
                    var entry = self.entries[id];
                    entryPromises.push(models.Entry.create({
                        id: entry.id,
                        lemma: entry.lemma,
                        ipa: entry.ipa,
                        partOfSpeech: entry.partOfSpeech,
                        SourceId: self.sources[entry.source].id,
                        createdAt: entry.editTime * 1000
                    }));
                }
                Promise.all(entryPromises).then(callback);
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
            en: self.eanaEltu.dictMeta[index].value
        };
        var localization = self.eanaEltu.dictLoc[index];
        for(var lc in localization){
            // The CZ language is in Upper case for some weird reason, this is a hack because of that
            if(self.languages[lc.toLowerCase()].active) {
                if(localization[lc].value === ''){
                    if(self.debug){
                        console.log("Missing " + lc + " translation for [" + index + "]");
                    }
                    if(self.missingMetadataTranslations[lc] === undefined){
                        self.missingMetadataTranslations[lc] = [];
                    }
                    self.missingMetadataTranslations[lc].push(index);
                }
            }

            self.metadata[index][lc] = localization[lc].value;

        }
    }
}

function buildDictionaryTemplates(self) {
    // Need to get list of languages
    for(var i = 0; i < self.activeLanguages.length; i++){
        self.templates[self.activeLanguages[i]] = {};
    }

    var regex = /__(.*)__/;

    for(var index in self.eanaEltu.dictWordTemplate){

        for(var j = 0; j < self.activeLanguages.length; j++){
            var format = self.eanaEltu.dictWordTemplate[index].format;
            var result = format.match(regex);
            if(result !== null) {
                var meta = self.metadata[result[1]];
                format = format.replace(result[0], meta[self.activeLanguages[j]]);
            }

            format = processTemplate(format);
            self.templates[self.activeLanguages[j]][index] = format;
        }
    }
}

function buildDictionaryEntries(self) {
    for(var id in self.eanaEltu.dictWordMeta){
        var rawEntry = self.eanaEltu.dictWordMeta[id];

        var entry = new Entry(rawEntry);
        self.sources[entry.source] = entry.source;

        if(self.partsOfSpeech[entry.type] === undefined){
            self.partsOfSpeech[entry.type] = {};
        }
        self.partsOfSpeech[entry.type][entry.partOfSpeech] = entry.partOfSpeech;
        if(entry.source === "") {
            if(self.debug){
                console.log("Missing Source: " + entry.lemma, entry.type, entry.id);
            }
            self.missingSources.push({id: entry.id, lemma: entry.lemma});
        }

        for(var i = 0; i < self.activeLanguages.length; i++){
            var lc = self.activeLanguages[i];

            var localizedEntry = self.eanaEltu.dictWordLoc[id][lc];
            var template = self.templates[lc][entry.type];

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
                entry.addLocalization(localizedEntry, template, lc);
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


