
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
    this.attributes = this.parseAttributes(rawLemma);
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

Lemma.prototype.parseAttributes = function(rawLemma) {
    "use strict";
    const odd = this.odd;
    if(odd === "" || odd === undefined || odd === null) {
        return [];
    } else {
        let attributes = [];
        if(odd.indexOf("%") === 0){
            this.odd = "";
        } else if(odd === "\\ ofp." || odd === "\\  ofp.") {
            attributes.push({attribute: "OFP"});
            this.odd = "";
        } else if(odd === "\\ ofp. (female)") {
            attributes.push({attribute: "OFP"});
            attributes.push({attribute: "NOTE", text: "female"});
            this.odd = "";
        } else if(odd === "\\ ofp. (male)") {
            attributes.push({attribute: "OFP"});
            attributes.push({attribute: "NOTE", text: "male"});
            this.odd = "";
        } else if(odd === "\\ ofp. (refers to a 'dim' person)"){
            attributes.push({attribute: "OFP"});
            attributes.push({attribute: "NOTE", text: "refers to a 'dim' person"});
            this.odd = "";
        } else if(odd === "\\ nfp.") {
            attributes.push({attribute: "NFP"});
            this.odd = "";
        } else if(odd === "\\ nfp. (e.g. a brave deed)"){
            attributes.push({attribute: "NFP"});
            attributes.push({attribute: "NOTE", text: "e.g. a brave deed"});
            this.odd = "";
        } else if(odd === "\\ (not normally allowable under Na'vi phonotactic rules)"){
            attributes.push({attribute: "Irregular Phonetics"});
            this.odd = "";
        } else if(odd === "\\ (stress moves to first syllable with infixation)") {
            attributes.push({attribute: "First Syllable Stress With Infixation"});
            this.odd = "";
        } else if(odd === "\\ (Used for appositions)") {
            attributes.push({attribute: "NOTE", text: "Used for appositions"});
            this.odd = "";
        } else if(odd === "\\ (Note: From Disney's Pandora - The World of Avatar)") {
            attributes.push({attribute: "NOTE", text: "From Disney's Pandora - The World of Avatar"});
            this.odd = "";
        } else if(odd === "\\ (Note: Name of bar at Disney's Pandora - The World of Avatar)") {
            attributes.push({attribute: "NOTE", text: "Name of bar at Disney's Pandora - The World of Avatar"});
            this.odd = "";
        } else if(odd === "\\ (Note: Also name of canteen at Disney's Pandora)") {
            attributes.push({attribute: "NOTE", text: "Also name of canteen at Disney's Pandora"});
            this.odd = "";
        } else if(odd === "\\ (Note: Also the name of the Disney Pandora location)") {
            attributes.push({attribute: "NOTE", text: "Also the name of the Disney Pandora location"});
            this.odd = "";
        } else if(odd === "\\ (Note: Being enthusiastic is always transitive in Na'vi -PF)") {
            attributes.push({attribute: "NOTE", text: "Being enthusiastic is always transitive in Na'vi -PF"});
            this.odd = "";
        } else if(odd === "\\ (Note: common misspelling as Omaticaya, sourced by the ASG)") {
            attributes.push({attribute: "NOTE", text: "common misspelling as Omaticaya, sourced by the ASG"});
            this.odd = "";
        } else if(odd === "\\ (The derivation of this word is not entirely clear. It may have originally been kesrankekehe, literally, ‘not yes, not no,’ in reference to whether a certain action was performed well or not, and over time it became shortened to just kesran, its use expanding to include anything only mediocre in quality.)") {
            attributes.push({attribute: "NOTE", text: "The derivation of this word is not entirely clear. It may have originally been kesrankekehe, literally, ‘not yes, not no,’ in reference to whether a certain action was performed well or not, and over time it became shortened to just kesran, its use expanding to include anything only mediocre in quality."});
            this.odd = "";
        } else if(odd === "\\ (Used with countable nouns in the singular form)") {
            attributes.push({attribute: "NOTE", text: "Used with countable nouns in the singular form"});
            this.odd = "";
        } else if(odd === "\\ (contraction)") {
            attributes.push({attribute: "CONTRACTION"});
            attributes.push({attribute: "NOTE", text: "contraction"});
            this.odd = "";
        } else if(odd === "\\ (sentence, not manner, adverbial)") {
            attributes.push({attribute: "NOTE", text: "sentence, not manner, adverbial"});
            this.odd = "";
        } else if(odd === "\\ (used with singular or plural noun forms)") {
            attributes.push({attribute: "NOTE", text: "used with singular or plural noun forms"});
            this.odd = "";
        } else if(odd === "\\ (with subjunctive verb in dependant clause)") {
            attributes.push({attribute: "NOTE", text: "with subjunctive verb in dependant clause"});
            this.odd = "";
        } else if(odd === "\\ (with the subjunctive)") {
            attributes.push({attribute: "NOTE", text: "with the subjunctive"});
            this.odd = "";
        } else if(odd === "\\ eg.  James Horner") {
            attributes.push({attribute: "EXAMPLE", text: "James Horner"});
            this.odd = "";
        } else if(odd === "\\ lit.: 'a clump of stars'") {
            attributes.push({attribute: "LITERAL", text: "a clump of stars"});
            this.odd = "";
        } else if(odd === "\\ lit.: 'a group of mindsets'") {
            attributes.push({attribute: "LITERAL", text: "a group of mindsets"});
            this.odd = "";
        } else if(odd === "\\ lit.: 'like a trap'") {
            attributes.push({attribute: "LITERAL", text: "like a trap"});
            this.odd = "";
        } else if(odd === "\\ lit.: 'little cloud'") {
            attributes.push({attribute: "LITERAL", text: "little cloud"});
            this.odd = "";
        } else if(odd === "\\ lit.: 'set of bones'") {
            attributes.push({attribute: "LITERAL", text: "set of bones"});
            this.odd = "";
        } else if(odd === "\\ lit.: 'without letting it fall'") {
            attributes.push({attribute: "LITERAL", text: "without letting it fall"});
            this.odd = "";
        } else if(odd === "\\ lit.: 'without letting it move'") {
            attributes.push({attribute: "LITERAL", text: "without letting it move"});
            this.odd = "";
        } else if(odd === "\\ lit.: 'without releasing it'") {
            attributes.push({attribute: "LITERAL", text: "without releasing it"});
            this.odd = "";
        } else if(odd === "\\textit{``Death is inevitable.\"}") {
            //attributes.push({attribute: "LITERAL", text: "Death is inevitable"});
            this.odd = "";
        } else if(odd === "\\ (lit. canopy fruit)") {
            attributes.push({attribute: "LITERAL", text: "canopy fruit"});
            this.odd = "";
        } else if(odd === "\\ (Can also be used metaphorically to refer to the level of anything scalable - anything that can have levels or degrees, highs and lows, water level, temperature, talent, anger, etc.)") {
            attributes.push({attribute: "NOTE", text: "Can also be used metaphorically to refer to the level of anything scalable - anything that can have levels or degrees, highs and lows, water level, temperature, talent, anger, etc."});
            this.odd = "";
        } else if(odd === "\\ (\\textit {example use:} \\textbf{rou fa pxir})") {
            attributes.push({attribute: "USAGE", text: "rou fa pxir"});
            this.odd = "";
        } else if(odd === "\\ (predicative copula, existential verb) (signifies possession with dative of possessor)") {
            attributes.push({attribute: "NOTE", text: "predicative copula, existential verb"});
            attributes.push({attribute: "NOTE", text: "signifies possession with dative of possessor"});
            this.odd = "";
        } else if(odd === "\\ (c.w. from {\\bf kem} {\\it action, deed})") {
            this.linkedLemmas.push({
                id: "kem"
            });
            this.odd = "";
        } else if(odd === "\\ (c.w. from {\\bf krr} {\\it time})") {
            this.linkedLemmas.push({
                id: "krr"
            });
            this.odd = "";
        } else if(odd === "\\ (c.w. from {\\bf krr} {\\it time} and {\\bf ta} {\\it from})") {
            this.linkedLemmas.push({
                id: "krr"
            });
            this.linkedLemmas.push({
                id: "ta"
            });
            this.odd = "";
        } else if(odd === "\\ (c.w. from {\\bf krr} {\\it time} and {\\bf maw} {\\it after})") {
            this.linkedLemmas.push({
                id: "krr"
            });
            this.linkedLemmas.push({
                id: "maw"
            });
            this.odd = "";
        } else if(odd === "\\ Contraction of \\textbf{na hufwe}") {
            this.linkedLemmas.push({
                id: "na"
            });
            this.linkedLemmas.push({
                id: "hufwe"
            });
            this.odd = "";
        } else if(odd === "\\ (contraction of \\textit{tsonit a})") {
            this.linkedLemmas.push({
                id: "tsonit"
            });
            this.linkedLemmas.push({
                id: "a"
            });
            this.odd = "";
        } else if(odd === "\\ (c.w. from {\\bf prrte'} {\\it pleasurable}, {\\bf kxener} {\\it smoke}, {\\bf trr} {\\it day} and {\\bf krr} {\\it time})") {
            this.linkedLemmas.push({
                id: "prrte'"
            });
            this.linkedLemmas.push({
                id: "kxener"
            });
            this.linkedLemmas.push({
                id: "trr"
            });
            this.linkedLemmas.push({
                id: "krr"
            });
            this.odd = "";
        } else if(odd === "\\ (contraction of {\\bf ke+zene+pivlltxe})") {
            this.linkedLemmas.push({
                id: "ke"
            });
            this.linkedLemmas.push({
                id: "zene"
            });
            this.linkedLemmas.push({
                id: "pivlltxe"
            });
            this.odd = "";
        } else if(odd === "\\ variant of slosneppe") {
            this.linkedLemmas.push({
                id: "slosneppe",
                note: "variant"
            });
            this.odd = "";
        } else if(odd === "\\ variant of peslosnep") {
            this.linkedLemmas.push({
                id: "peslosnep",
                note: "variant"
            });
            this.odd = "";
        } else if(odd === "\\ variant of fyinep'angpe") {
            this.linkedLemmas.push({
                id: "fyinep'angpe",
                note: "variant"
            });
            this.odd = "";
        } else if(odd === "\\ variant of pefyinep'ang") {
            this.linkedLemmas.push({
                id: "pefyinep'ang",
                note: "variant"
            });
            this.odd = "";
        } else if(odd === "\\ Note: \\textit{soaia} contracts to \\textit{sway}") {
            attributes.push({attribute: "NOTE", text: "<i>soaia</i> contracts to <i>sway</i>"});
            this.odd = "";
        } else if(odd === "\\ ({\\bf ayoenga--} base for suffixes)") {
            attributes.push({attribute: "NOTE", text: "<b>ayoenga--</b> base for suffixes"});
            this.odd = "";
        } else if(odd === "\\ (never plural {\\bf u})") {
            attributes.push({attribute: "NOTE", text: "never plural <b>u</b>"});
            this.odd = "";
        } else if(odd === "\\ (lenited form of {\\bf tsat})") {
            this.linkedLemmas.push({
                id: "tsat",
                note: "lenited form"
            });
            this.odd = "";
        } else if(odd === "\\ (synonym: {\\bf tslolam})") {
            this.linkedLemmas.push({
                id: "tslolam",
                note: "synonym"
            });
            this.odd = "";
        } else if(odd === "\\ (Pronounced [\\textipa{tI.\\textprimstress wEjk.tIN}] in casual speech)") {
            attributes.push({attribute: "ALT_IPA", text: "Pronounced [\\textipa{tI.\\textprimstress wEjk.tIN}] in casual speech"});
            this.odd = "";
        } else if(odd === "\\ Note: In compounds, the ä and e drop,   yielding --\\textit{smung}") {
            attributes.push({attribute: "NOTE", text: "In compounds, the ä and e drop,   yielding --<i>smung</i>"});
            this.odd = "";
        } else if(odd === "\\ Note: colloquially, \\textbf{yo} can be used in place of \\textbf{fyanyo}.") {
            attributes.push({attribute: "NOTE", text: "colloquially, <b>yo</b> can be used in place of <b>fyanyo</b>."});
            this.odd = "";
        } else if(odd === "\\ transitive form of \\textit{klltxay}") {
            attributes.push({attribute: "NOTE", text: "transitive form of <i>klltxay</i>"});
            this.odd = "";
        } else if(odd === "\\ (affectionate form {\\bf Kamtsyìp})") {
            this.linkedLemmas.push({
                id: "kamtsyìp",
                note: "affectionate"
            });
            this.odd = "";
        }

        return attributes;
    }
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
