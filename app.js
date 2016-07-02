var mysql = require('mysql');

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
fetchHashTableData(eanaEltuConnection, 'SELECT id, type, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, odd, block, editTime, audio FROM dictWordMeta', 'id', undefined, function (data) {
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

function buildDictionaryMetadata(languages) {
    var metadata = {};
    for(var index in eanaEltu.dictMeta){
        metadata[index] = {
            en: eanaEltu.dictMeta[index].value
        };
        var localization = eanaEltu.dictLoc[index];
        for(var lc in localization){
            // The CZ language is in Upper case for some weird reason, this is a hack because of that
            if(languages[lc.toLowerCase()].active) {
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

function buildDictionary() {
    console.log("Building Dictionary...");
    var languages = buildDictionaryLanguages();
    var metadata = buildDictionaryMetadata(languages);

}

var dictionary = {
    languages: {
        name: 'nativeName',
        englishName: 'englishName',
        active: 'active'
    },
    entries: {

    }
};

