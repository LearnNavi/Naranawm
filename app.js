

var mysql = require('mysql');

function fetchHashTableData(db, query, id, group, callback) {
  db.query(query, function(err, rows, fields) {
    if (err) throw err;
    var data;
    if(id !== undefined){
      data = {};
    } else {
      data = [];
    }
    for (var i = 0; i < rows.length; i++){
      if(id !== undefined){
        if(data[rows[i][id]] === undefined){
          data[rows[i][id]] = {};
        }
        if(group !== undefined) {
          if(data[rows[i][id]][rows[i][group]] === undefined) {
            data[rows[i][id]][rows[i][group]] = {};
          }
          for (var j = 0; j < fields.length; j++){
            data[rows[i][id]][rows[i][group]][fields[j].name] = rows[i][fields[j].name];
          }
        } else {
          for (var j = 0; j < fields.length; j++){
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

// Fetch dictLanguages
fetchHashTableData(eanaEltuConnection, 'SELECT lc, engName, nativeName, active FROM dictLanguages', 'lc', undefined, function(data){
  eanaEltu.dictLanguages = data;
});

// Fetch dictLayout
fetchHashTableData(eanaEltuConnection, 'SELECT id, value FROM dictLayout', 'id', undefined, function(data){
  eanaEltu.dictLayout = data;
});

// Fetch dictLoc
fetchHashTableData(eanaEltuConnection, 'SELECT id, value, lc, editTime FROM dictLoc', 'id', 'lc', function(data){
  eanaEltu.dictLoc = data;
});

// Fetch dictMeta
fetchHashTableData(eanaEltuConnection, 'SELECT id, value, editTime FROM dictMeta', 'id', undefined, function(data){
  eanaEltu.dictMeta = data;
});

// Fetch dictWordTemplate
fetchHashTableData(eanaEltuConnection, 'SELECT id, format, argc, changeable FROM dictWordTemplate', 'id', undefined, function(data){
  eanaEltu.dictWordTemplate = data;
});


// dictLoc is the localization for dictMeta
// Combine them together





eanaEltuConnection.end(function(err){
    //console.log(eanaEltu);
});



