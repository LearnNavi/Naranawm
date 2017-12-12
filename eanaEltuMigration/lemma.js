
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
    this.grapheme = parseGrapheme(rawLemma.arg1);
    this.type = rawLemma.type;
    this.odd = rawLemma.odd;
    this.block = rawLemma.block;
    this.editTime = rawLemma.editTime;
    this.audio = rawLemma.audio;
    this.source = parseSource(rawLemma);
    this.classTypes = this.parseLemmaClasses(rawLemma);
    this.ipa = parseIpa(rawLemma);
    this.definitions = {};
    this.linkedLemmas = this.parseLinkedLemmas(rawLemma);
    this.rejected = this.parseRejected(rawLemma);

    this.rawLemma = rawLemma;
}

Lemma.prototype.addDefinition = function (definition, lc) {
    // Pull out each of the 10 args, if the arg is missing from the localized version, use the primary instead
    const entry = {
        odd: definition.odd,
        editTime: definition.editTime,
        lc: definition.lc,
        classTypes: this.parseLemmaClasses(definition),
        //linkedLemmas: this.parseLinkedLemmas(definition, ),
        definition: this.parseDefinition(definition),
        note: this.parseNote(definition),
        loanWordLanguage: this.parseLoanWordLanguage(definition),
        loanWordDefinition: this.parseLoanWordDefinition(definition),
        arg1: definition.arg1,
        arg2: definition.arg2,
        arg3: definition.arg3,
        arg4: definition.arg4,
        arg5: definition.arg5,
        arg6: definition.arg6,
        arg7: definition.arg7,
        arg8: definition.arg8,
        arg9: definition.arg9,
        arg10: definition.arg10
    };

    this.definitions[lc] = entry;

    return entry;
};

Lemma.prototype.finalizeLemma = function () {
    delete this.rawLemma;
};

Lemma.prototype.parseRejected = function(rawLemma) {
    "use strict";
    return (rawLemma.block === 1);
};

Lemma.prototype.parseDefinition = function(definition) {
    "use strict";
    switch(this.type){
        case "affixN":
        case "derivingaffixN":
        case "infixcwN":
        case "infixN":
        case "markerN":
            return definition.arg3;

        case "cw":
        case "cww":
        case "derive":
        case "derives":
        case "lenite":
        case "loan":
        case "note":
        case "word":
            return definition.arg4;


        case "alloffixN":
            return definition.arg5;

    }
};

Lemma.prototype.parseNote = function(definition) {
    "use strict";
    switch(this.type){
        case "note":
            return definition.arg5;

    }
};

Lemma.prototype.parseLoanWordLanguage = function(definition) {
    "use strict";
    switch(this.type){
        case "loan":
            return definition.arg7;

    }
};

Lemma.prototype.parseLoanWordDefinition = function(definition) {
    "use strict";
    switch(this.type){
        case "loan":
            return definition.arg5;

    }
};

Lemma.prototype.parseLinkedLemmas = function(rawLemma) {
    "use strict";

    switch(this.type){
        // Process CW type
        case "cw":
        case "derive":
            return [{
                id: rawLemma.arg5,
                note: rawLemma.arg6
            }, {
                id: rawLemma.arg7,
                note: rawLemma.arg8
            }];

        case "cww":
        case "derives":
            return [{
                id: rawLemma.arg5,
                note: rawLemma.arg6
            }];

        case "note":
            return [{
                id: rawLemma.arg6,
                note: rawLemma.arg7
            }];
        case "lenite":
            return [{
                id: rawLemma.arg5
            }];

        default:
            return [];
    }
};

Lemma.prototype.parseLemmaClasses = function(definition) {
    // Part of Speech
    let result = "";
    switch(this.type){
        // arg 3
        case 'affect':
        case 'affectN':
        case 'affectNN':
        case 'affix':
        case 'affixNN':
        case 'cw':
        case 'cww':
        case 'derive':
        case 'deriveall':
        case 'derives':
        case 'derivingaffix':
        case 'derivingaffixNN':
        case 'infix':
        case 'infixNN':
        case 'infixcw':
        case 'infixcwNN':
        case 'infixcww':
        case 'infixcwww':
        case 'lenite':
        case 'liu':
        case 'loan':
        case 'marker':
        case 'markerNN':
        case 'note':
        case 'pcw':
        case 'pderives':
        case 'pword':
        case 'word':
            result += definition.arg3;
            break;

        // Arg 4
        case 'alloffix':
        case 'alloffixN':
        case 'alloffixNN':
        case 'alloffixx':
        case 'alloffixxN':
            result += definition.arg4;
            break;

        // Arg 7
        case "markerN":
        case "derivingaffixN":
            result += definition.arg7;
            break;

        // Arg 8
        case 'infixN':
            result += definition.arg8;
            break;

        // Arg 9
        case 'allofix':
            result += definition.arg9;
            break;

        // Arg 10
        case "infixcwN":
            result += definition.arg10;
            break;
    }
    const types = result.split(",");
    for(let type of types){
        type = type.trim();
    }
    return types;
};

function parseGrapheme(lemma){
    "use strict";

}

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
