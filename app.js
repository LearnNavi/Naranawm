var mysql = require('mysql');
var format = require('string-format');
var http = require('http');
var PORT = 8080;

var dictionary = {};

//We need a function which handles requests and send response
function handleRequest(request, response){
    console.log(request.url);
    switch(request.url) {
        case "/":
            response.end("Mobile App Database System");
            break;
        case "/dictionary/templates":
            var htmlText = "";
            for(var lc in dictionary.templates){
                htmlText += "<h1>" + lc + "</h1>";
                for(var index in dictionary.templates[lc]){
                    htmlText += dictionary.templates[lc][index];
                }
            }
            response.end(htmlText);
            response.end(JSON.stringify(dictionary.templates));
            break;

        case "/dictionary/languages":
            response.end(JSON.stringify(dictionary.languages));
            break;

        case "/dictionary/metadata":
            response.end(JSON.stringify(dictionary.metadata));
            break;

         // Fetch dictLanguages
        case "/eanaEltu/dictLanguages":
            response.end(JSON.stringify(eanaEltu.dictLanguages));
            break;

         // Fetch dictLayout
        case "/eanaEltu/dictLayout":
            response.end(JSON.stringify(eanaEltu.dictLayout));
            break;

         // Fetch dictLoc
        case "/eanaEltu/dictLoc":
            response.end(JSON.stringify(eanaEltu.dictLoc));
            break;

         // Fetch dictMeta
        case "/eanaEltu/dictMeta":
            response.end(JSON.stringify(eanaEltu.dictMeta));
            break;

         // Fetch dictOrder
        case "/eanaEltu/dictOrder":
            response.end(JSON.stringify(eanaEltu.dictOrder));
            break;

         // Fetch dictWordLoc
        case "/eanaEltu/dictWordLoc":
            response.end(JSON.stringify(eanaEltu.dictWordLoc));
            break;

         // Fetch dictWordMeta
        case "/eanaEltu/dictWordMeta":
            response.end(JSON.stringify(eanaEltu.dictWordMeta));
            break;

         // Fetch dictWordTemplate
        case "/eanaEltu/dictWordTemplate":
            response.end(JSON.stringify(eanaEltu.dictWordTemplate));
            break;

        default:
            response.end("This path doesn't exist: " + request.url);
    }

}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: http://localhost:%s", PORT);
});

function fetchHashTableData(db, query, id, group, callback) {
    db.query(query, function (err, rows, fields) {
        if (err) throw err;
        var data;
        if (id !== undefined) {
            data = {};
        } else {
            data = [];
        }
        for (var i = 0; i < rows.length; i++) {
            if (id !== undefined) {
                if (data[rows[i][id]] === undefined) {
                    data[rows[i][id]] = {};
                }
                if (group !== undefined) {
                    if (data[rows[i][id]][rows[i][group]] === undefined) {
                        data[rows[i][id]][rows[i][group]] = {};
                    }
                    for (var j = 0; j < fields.length; j++) {
                        data[rows[i][id]][rows[i][group]][fields[j].name] = rows[i][fields[j].name];
                    }
                } else {
                    for (var j = 0; j < fields.length; j++) {
                        data[rows[i][id]][fields[j].name] = rows[i][fields[j].name];
                    }
                }


            } else {
                data.push(rows[i]);
            }
        }
        callback(data);
    });
}

var eanaEltuConnection = mysql.createConnection({
    host: 'localhost',
    user: 'mobile',
    password: 'mobile',          // Dev Credentials - Needs to be swapped out with Prod credentials
    database: 'eanaeltu'
});

eanaEltuConnection.connect();

var eanaEltu = {};

console.log("Fetching EanaEltu Data...");

// Fetch dictLanguages
fetchHashTableData(eanaEltuConnection, 'SELECT lc, engName, nativeName, active FROM dictLanguages', 'lc', undefined, function (data) {
    eanaEltu.dictLanguages = data;
});

// Fetch dictLayout
fetchHashTableData(eanaEltuConnection, 'SELECT id, value FROM dictLayout', 'id', undefined, function (data) {
    eanaEltu.dictLayout = data;
});

// Fetch dictLoc
fetchHashTableData(eanaEltuConnection, 'SELECT id, value, lc, editTime FROM dictLoc', 'id', 'lc', function (data) {
    eanaEltu.dictLoc = data;
});

// Fetch dictMeta
fetchHashTableData(eanaEltuConnection, 'SELECT id, value, editTime FROM dictMeta', 'id', undefined, function (data) {
    eanaEltu.dictMeta = data;
});

// Fetch dictOrder
fetchHashTableData(eanaEltuConnection, 'SELECT id, pos, type, data1, data2 FROM dictOrder', 'id', 'pos', function (data) {
    eanaEltu.dictOrder = data;
});

// Fetch dictWordLoc
fetchHashTableData(eanaEltuConnection, 'SELECT id, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, odd, lc, editTime FROM dictWordLoc', 'id', 'lc', function (data) {
    eanaEltu.dictWordLoc = data;
});

// Fetch dictWordMeta
fetchHashTableData(eanaEltuConnection, 'SELECT id, type, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, odd, block, editTime, audio, \'en\' as lc FROM dictWordMeta', 'id', undefined, function (data) {
    eanaEltu.dictWordMeta = data;
});

// Fetch dictWordTemplate
fetchHashTableData(eanaEltuConnection, 'SELECT id, format, argc, changeable FROM dictWordTemplate', 'id', undefined, function (data) {
    eanaEltu.dictWordTemplate = data;
});

eanaEltuConnection.end(function (err) {
    console.log('Fetch Complete');
    // All data has been fetched
    // Start processing the data
    buildDictionary();
});


function buildDictionaryLanguages() {
    var languages = {
        en: {
            engName: "English",
            nativeName: "English",
            active: 1
        }
    };
    for(var index in eanaEltu.dictLanguages){
        var language = eanaEltu.dictLanguages[index];

        languages[index] = {
            engName: language.engName,
            nativeName: language.nativeName,
            active: language.active
        };

    }
    return languages;
}

function buildDictionaryMetadata() {
    var metadata = {};
    for(var index in eanaEltu.dictMeta){
        metadata[index] = {
            en: eanaEltu.dictMeta[index].value
        };
        var localization = eanaEltu.dictLoc[index];
        for(var lc in localization){
            // The CZ language is in Upper case for some weird reason, this is a hack because of that
            if(dictionary.languages[lc.toLowerCase()].active) {
                if(localization[lc].value === ''){
                    console.log("Missing " + lc + " translation for [" + index + "]");
                }
                metadata[index][lc] = localization[lc].value;
            } else {
                // Skip inactive languages
            }
        }
    }
    return metadata;
}

function buildDictionaryTemplates() {
    // Need to get list of languages
    var languages = getActiveLanguages();
    var templates = {};
    for(var i = 0; i < languages.length; i++){
        templates[languages[i]] = {};
    }

    var regex = /__(.*)__/;

    for(var index in eanaEltu.dictWordTemplate){

        for(var j = 0; j < languages.length; j++){
            var format = eanaEltu.dictWordTemplate[index].format;
            var result = format.match(regex);
            if(result !== null) {
                var meta = dictionary.metadata[result[1]];
                format = format.replace(result[0], meta[languages[j]]);
            }

            format = processTemplate(format);
            templates[languages[j]][index] = format;
        }
    }

    return templates;
}

function processRegexReplace(regex, text, replacementTextStart, replacementTextEnd) {
    var result = text.match(regex);

    while(result !== null){
        text = text.replace(result[0], replacementTextStart + result[1] + replacementTextEnd);
        result = text.match(regex);
    }
    return text;
}

function getActiveLanguages() {
    if(dictionary.languages === undefined){
        return [];
    }

    var languages = [];
    for(var index in dictionary.languages){
        if(dictionary.languages[index].active){
            languages.push(index);
        }
    }
    return languages;
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

function processEntry(primaryEntry, localizedEntry) {
    // Pull out each of the 10 args, if the arg is missing from the localized version, use the primary instead
    var entry = {
        type: primaryEntry.type,
        odd: primaryEntry.odd,
        locOdd: localizedEntry.odd,
        block: primaryEntry.block,
        editTime: primaryEntry.editTime,
        locEditTime: localizedEntry.editTime,
        audio: primaryEntry.audio,
        lc: localizedEntry.lc,
        arg1: localizedEntry.arg1 !== null ? localizedEntry.arg1 : primaryEntry.arg1,
        arg2: localizedEntry.arg2 !== null ? localizedEntry.arg2 : primaryEntry.arg2,
        arg3: localizedEntry.arg3 !== null ? localizedEntry.arg3 : primaryEntry.arg3,
        arg4: localizedEntry.arg4 !== null ? localizedEntry.arg4 : primaryEntry.arg4,
        arg5: localizedEntry.arg5 !== null ? localizedEntry.arg5 : primaryEntry.arg5,
        arg6: localizedEntry.arg6 !== null ? localizedEntry.arg6 : primaryEntry.arg6,
        arg7: localizedEntry.arg7 !== null ? localizedEntry.arg7 : primaryEntry.arg7,
        arg8: localizedEntry.arg8 !== null ? localizedEntry.arg8 : primaryEntry.arg8,
        arg9: localizedEntry.arg9 !== null ? localizedEntry.arg9 : primaryEntry.arg9,
        arg10: localizedEntry.arg10 !== null ? localizedEntry.arg10 : primaryEntry.arg10
    };

    // This needs to get defined somewhere else (I see a major refactor coming soon...)
    var ipaTypes = [
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

    var nonIpaTypes = [
        'infixNN',
        'affectNN',
        'infixcwNN',
        'affixNN',
        'alloffixNN',
        'derivingaffixNN',
        'markerNN',
        'eanaInfix'
    ];

    var parsedEntry = format(dictionary.templates[entry.lc][entry.type], undefined, entry.arg1, entry.arg2, entry.arg3, entry.arg4, entry.arg5, entry.arg6, entry.arg7, entry.arg8, entry.arg9, entry.arg10);

    if(nonIpaTypes.indexOf(primaryEntry.type) > -1){
        // Not an IPA entry...
        console.log(primaryEntry.type, parsedEntry);

    } else {

    }

    var textPrimStressRegex = /\\textprimstress/;
    //parsedEntry = processRegexReplace()
}

function processIpaEntry() {

}

function buildDictionaryEntries() {
    var languages = getActiveLanguages();
    for(var id in eanaEltu.dictWordMeta){
        var entry = eanaEltu.dictWordMeta[id];
        for(var i = 0; i < languages.length; i++){
            var lc = languages[i];
            var localizedEntry = eanaEltu.dictWordLoc[id][lc];
            if(localizedEntry === undefined){
                localizedEntry = entry;
            }

            var parsedEntry = processEntry(entry, localizedEntry);

            //console.log(id, entry.type, parsedEntry);

        }


    }
}

function buildDictionary() {
    console.log("Building Dictionary...");
    dictionary.languages = buildDictionaryLanguages();
    dictionary.metadata = buildDictionaryMetadata();
    dictionary.templates = buildDictionaryTemplates();
    dictionary.entries = buildDictionaryEntries();
    console.log("Complete");
}

/*var dictionary = {
    languages: {
        name: 'nativeName',
        englishName: 'englishName',
        active: 'active'
    },
    entries: {

    }
};
*/
