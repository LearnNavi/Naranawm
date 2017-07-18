
const format = require('string-format');

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


function Lemma(rawLemma) {
    this.id = rawLemma.id;
    this.pubId = rawLemma.id << 2; // No clue why all public IDs use a bit shift of 2 vs internal...
    this.lemma = rawLemma.arg1;
    this.type = rawLemma.type;
    this.odd = rawLemma.odd;
    this.block = rawLemma.block;
    this.editTime = rawLemma.editTime;
    this.audio = rawLemma.audio;
    this.source = parseSource(rawLemma);
    this.partOfSpeech = this.parsePartOfSpeech(rawLemma);
    this.ipa = parseIpa(rawLemma);
    this.localizations = {};

    this.rawLemma = rawLemma;
}

Lemma.prototype.addLocalization = function (localizedDefinition, lc) {
    // Pull out each of the 10 args, if the arg is missing from the localized version, use the primary instead
    const entry = {
        odd: localizedDefinition.odd,
        editTime: localizedDefinition.editTime,
        lc: localizedDefinition.lc,
        partOfSpeech: this.parsePartOfSpeech(localizedDefinition),
        arg1: localizedDefinition.arg1,
        arg2: localizedDefinition.arg2,
        arg3: localizedDefinition.arg3,
        arg4: localizedDefinition.arg4,
        arg5: localizedDefinition.arg5,
        arg6: localizedDefinition.arg6,
        arg7: localizedDefinition.arg7,
        arg8: localizedDefinition.arg8,
        arg9: localizedDefinition.arg9,
        arg10: localizedDefinition.arg10
    };

    this.localizations[lc] = entry;

    return entry;
};

Lemma.prototype.finalizeLemma = function () {
    delete this.rawLemma;
};

Lemma.prototype.parsePartOfSpeech = function(localization) {
    // Part of Speech
    let result = "";
    switch(this.type){
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
            result += localization.arg3;
            break;

        // Arg 4
        case 'alloffix':
        case 'alloffixN':
        case 'alloffixNN':
        case 'alloffixx':
        case 'alloffixxN':
            result += localization.arg4;
            break;

        // Arg 9
        case 'allofix':
            result += localization.arg9;
            break;
    }

    return result.trim();
};

function parseSource(entry) {
    // Source
    let source = "";
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
            source = entry.arg4;
            break;
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
            source = entry.arg5;
            break;
        // Arg 6
        case 'alloffix':
        case 'alloffixN':
        case 'alloffixNN':
        case 'alloffixx':
        case 'alloffixxN':
        case 'lenite':
        case 'loan':
            source = entry.arg6;
            break;
        // Arg 7
        case 'cww':
        case 'derives':
        case 'infixcw':
        case 'infixcwN':
        case 'pderives':
            source = entry.arg7;
            break;
        // Arg 8
        case 'deriveall':
        case 'infixcww':
        case 'note':
            source = entry.arg8;
            break;
        // Arg 9
        case 'cw':
        case 'derive':
        case 'infixcwww':
        case 'pcw':
            source = entry.arg9;
            break;

    }

    if(source === "PF,D"){
        source = "PF, D";
    }

    return source;
}

function parseIpa(entry) {
    if(nonIpaTypes.indexOf(entry.type) === -1){
        let rawIpa = entry.arg2;

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

        const missed = rawIpa.match(/(\\)/);
        if(missed !== null){
            console.log(missed, entry.arg1, rawIpa, entry.arg2);
        }
        //console.log(entry.arg1, rawIpa);
        return rawIpa;
    } else {
        console.log("EXISTS", entry);
        process.exit(0);
    }
    // Not an IPA type, return nothing, it will make the ipa field not show up on the object
}

function processRegexReplace(regex, text, replacementText) {
    let result = text.match(regex);

    while(result !== null){
        text = text.replace(result[0], replacementText);
        result = text.match(regex);
    }
    return text;
}

module.exports = Lemma;
