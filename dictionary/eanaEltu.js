
var mysql = require('mysql');
var vault = require('../vault');

function EanaEltu() {
    this.debug = false;
    this.rawEEdata = {};
    this.dbConnection = mysql.createConnection({
        host: vault.eanaEltu.host,
        user: vault.eanaEltu.username,
        password: vault.eanaEltu.password,          // Dev Credentials - Needs to be swapped out with Prod credentials
        database: vault.eanaEltu.database
    });
}

EanaEltu.prototype.fetchHashTableData = function (query, id, group, callback) {
    this.dbConnection.query(query, function (err, rows, fields) {
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
};

EanaEltu.prototype.fetchData = function (callback) {
    var self = this;
    if(this.debug){
        console.log("Fetching EanaEltu Data...");
    }
    this.dbConnection.connect();

    // Fetch dictLanguages
    this.fetchHashTableData('SELECT lc, engName, nativeName, active FROM dictLanguages', 'lc', undefined, function (data) {
        self.rawEEdata.dictLanguages = data;
    });

    // Fetch dictLayout
    this.fetchHashTableData('SELECT id, value FROM dictLayout', 'id', undefined, function (data) {
        self.rawEEdata.dictLayout = data;
    });

    // Fetch dictLoc
    this.fetchHashTableData('SELECT id, value, lc, editTime FROM dictLoc', 'id', 'lc', function (data) {
        self.rawEEdata.dictLoc = data;
    });

    // Fetch dictMeta
    this.fetchHashTableData('SELECT id, value, editTime FROM dictMeta', 'id', undefined, function (data) {
        self.rawEEdata.dictMeta = data;
    });

    // Fetch dictOrder
    this.fetchHashTableData('SELECT id, pos, type, data1, data2 FROM dictOrder', 'id', 'pos', function (data) {
        self.rawEEdata.dictOrder = data;
    });

    // Fetch dictWordLoc
    this.fetchHashTableData('SELECT id, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, odd, lc, editTime FROM dictWordLoc', 'id', 'lc', function (data) {
        self.rawEEdata.dictWordLoc = data;
    });

    // Fetch dictWordMeta
    this.fetchHashTableData('SELECT id, type, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, odd, block, editTime, audio, \'en\' as lc FROM dictWordMeta', 'id', undefined, function (data) {
        self.rawEEdata.dictWordMeta = data;
    });

    // Fetch dictWordTemplate
    this.fetchHashTableData('SELECT id, format, argc, changeable FROM dictWordTemplate', 'id', undefined, function (data) {
        self.rawEEdata.dictWordTemplate = data;
    });

    this.dbConnection.end(function (err) {
        if(self.debug){
            console.log('Fetch Complete');
        }
        // All data has been fetched
        // Start processing the data
        callback(self.rawEEdata);
    });
};

module.exports = EanaEltu;
