
var format = require('string-format');

const nonIpaTypes = [
        'infixNN',
        'affectNN',
        'infixcwNN',
        'affixNN',
        'alloffixNN',
        'derivingaffixNN',
        'markerNN',
        'eanaInfix'],
    ipaTypes = [
        'word',
        'lenite',
        'marker',
        'cw',
        'cww',
        'loan',
        'note',
        'derive',
        'derives',
        'deriveall',
        'infix',
        'affect',
        'affix',
        'alloffix',
        'alloffixx',
        'derivingaffix',
        'infixcw',
        'infixcww',
        'infixcwww',
        'infixN',
        'affectN',
        'infixcwN',
        'affixN',
        'alloffixN',
        'alloffixxN',
        'derivingaffixN',
        'markerN',
        'pword',
        'pcw',
        'pderives',
        'liu'
    ];


function Entry(rawEntry) {
    this.id = rawEntry.id;
    this.lemma = rawEntry.arg1;
    this.type = rawEntry.type;
    this.odd = rawEntry.odd;
    this.block = rawEntry.block;
    this.editTime = rawEntry.editTime;
    this.audio = rawEntry.audio;
    this.source = parseSource(rawEntry);
    this.partOfSpeech = parsePartOfSpeech(rawEntry);
    this.ipa = parseIpa(rawEntry);
    this.localizations = {};

    this.rawEntry = rawEntry;
}

Entry.prototype.addLocalization = function (localizedEntry, template, lc) {
    // Pull out each of the 10 args, if the arg is missing from the localized version, use the primary instead
    var entry = {
        odd: localizedEntry.odd,
        editTime: localizedEntry.editTime,
        lc: localizedEntry.lc,
        arg3: localizedEntry.arg3 !== null ? localizedEntry.arg3 : this.rawEntry.arg3,
        arg4: localizedEntry.arg4 !== null ? localizedEntry.arg4 : this.rawEntry.arg4,
        arg5: localizedEntry.arg5 !== null ? localizedEntry.arg5 : this.rawEntry.arg5,
        arg6: localizedEntry.arg6 !== null ? localizedEntry.arg6 : this.rawEntry.arg6,
        arg7: localizedEntry.arg7 !== null ? localizedEntry.arg7 : this.rawEntry.arg7,
        arg8: localizedEntry.arg8 !== null ? localizedEntry.arg8 : this.rawEntry.arg8,
        arg9: localizedEntry.arg9 !== null ? localizedEntry.arg9 : this.rawEntry.arg9,
        arg10: localizedEntry.arg10 !== null ? localizedEntry.arg10 : this.rawEntry.arg10,
        rawEntry: localizedEntry
    };

    /*var parsedEntry = format(
        template, undefined,
        primaryEntry.arg1,
        primaryEntry.arg2,
        primaryEntry.arg3,
        primaryEntry.arg4,
        primaryEntry.arg5,
        primaryEntry.arg6,
        primaryEntry.arg7,
        primaryEntry.arg8,
        primaryEntry.arg9,
        primaryEntry.arg10);*/

    //this.localizations[lc] = entry;
};

Entry.prototype.finalizeEntry = function () {
    delete this.rawEntry;
    for (var lc in this.localizations) {
        if (this.localizations.hasOwnProperty(lc)) {
            delete this.localizations[lc].rawEntry;
            delete this.localizations[lc].arg3;
            delete this.localizations[lc].arg4;
            delete this.localizations[lc].arg5;
            delete this.localizations[lc].arg6;
            delete this.localizations[lc].arg7;
            delete this.localizations[lc].arg8;
            delete this.localizations[lc].arg9;
            delete this.localizations[lc].arg10;
        }
    }
};

function parsePartOfSpeech(entry) {
    // Part of Speech
    switch(entry.type){
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
        case 'derivingAffix':
        case 'derivingAffixN':
        case 'derivingaffixNN':
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
            return entry.arg3;

        // Arg 4
        case 'alloffix':
        case 'alloffixN':
        case 'alloffixNN':
        case 'alloffixx':
        case 'alloffixxN':
            return entry.arg4;

        // Arg 9
        case 'allofix':
            return entry.arg9;

    }

    return "";
}

function parseSource(entry) {
    // Source
    switch(entry.type){
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
            return entry.arg4;

        // Arg 5
        case 'affix':
        case 'affixN':
        case 'affixNN':
        case 'infixN':
        case 'infixNN':
        case 'infixcwNN':
        case 'liu':
        case 'pword':
        case 'word':
            return entry.arg5;

        // Arg 6
        case 'alloffix':
        case 'alloffixN':
        case 'alloffixNN':
        case 'alloffixx':
        case 'alloffixxN':
        case 'lenite':
        case 'loan':
            return entry.arg6;

        // Arg 7
        case 'cww':
        case 'derives':
        case 'infixcw':
        case 'infixcwN':
        case 'pderives':
            return entry.arg7;

        // Arg 8
        case 'deriveall':
        case 'infixcww':
        case 'note':
            return entry.arg8;

        // Arg 9
        case 'cw':
        case 'derive':
        case 'infixcwww':
        case 'pcw':
            return entry.arg9;


    }

    return "";
}

function parseIpa(entry) {
    if(nonIpaTypes.indexOf(entry.type) === -1){
        var rawIpa = entry.arg2;

        // Need to do some string manipulation to get the correct IPA value out
        //rawIpa = processRegexReplace(/(\\\\)/g, rawIpa, "\\");
        rawIpa = processRegexReplace(/(\\textprimstress )/g, rawIpa, "\u02C8");
        rawIpa = processRegexReplace(/(\\textprimstress)/g, rawIpa, "\u02C8");
        rawIpa = processRegexReplace(/(\\textsecstress )/g, rawIpa, "\u02CC");
        rawIpa = processRegexReplace(/(\\textsecstress)/g, rawIpa, "\u02CC");
        rawIpa = processRegexReplace(/(\\textcorner)/g, rawIpa, "\u031A");
        rawIpa = processRegexReplace(/(\\ )/g, rawIpa, " ");
        rawIpa = processRegexReplace(/(E)/, rawIpa, "\u025B");
        rawIpa = processRegexReplace(/(P)/, rawIpa, "\u0294");
        rawIpa = processRegexReplace(/(J)/, rawIpa, "\u029D");
        rawIpa = processRegexReplace(/(R)/, rawIpa, "\u027E");
        rawIpa = processRegexReplace(/(M)/, rawIpa, "\u0271");
        rawIpa = processRegexReplace(/(N)/, rawIpa, "\u014B");
        rawIpa = processRegexReplace(/(I)/, rawIpa, "\u026A");
        rawIpa = processRegexReplace(/(Z)/, rawIpa, "\u0292");
        rawIpa = processRegexReplace(/(\\t\{ts\})/, rawIpa, "t\u0361s");
        rawIpa = processRegexReplace(/(\\textsyllabic{l})/, rawIpa, "l\u0329");
        rawIpa = processRegexReplace(/(\\textsyllabic{r})/, rawIpa, "r\u0329");
        // Illegal phonetics for Na'vi - bug in EE data
        rawIpa = processRegexReplace(/(\\textsyllabic{ts})/, rawIpa, "\u02A6\u0329");
        rawIpa = processRegexReplace(/(\\textesh )/, rawIpa, "\u0283");
        rawIpa = processRegexReplace(/(\\textesh)/, rawIpa, "\u0283");
        rawIpa = processRegexReplace(/(\$\\cdot\$)/, rawIpa, "\u22C5");
        rawIpa = processRegexReplace(/(\$\\_\$)/, rawIpa, "_");

        var missed = rawIpa.match(/(\\)/);
        if(missed !== null){
            console.log(missed, entry.arg1, rawIpa, entry.arg2);
        }
        //console.log(entry.arg1, rawIpa);
        return rawIpa;
    }
    // Not an IPA type, return nothing, it will make the ipa field not show up on the object
}

function processRegexReplace(regex, text, replacementText) {
    var result = text.match(regex);

    while(result !== null){
        text = text.replace(result[0], replacementText);
        result = text.match(regex);
    }
    return text;
}

module.exports = Entry;
