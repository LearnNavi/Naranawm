"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var env       = process.env.NODE_ENV || "development";
var vault     = require('../vault');

if (process.env.DATABASE_URL) {
    var sequelize = new Sequelize(process.env.DATABASE_URL,vault[env].ln_dictionary);
} else {
    var sequelize = new Sequelize(vault[env].ln_dictionary.database, vault[env].ln_dictionary.username, vault[env].ln_dictionary.password, vault[env].ln_dictionary);
}
var db        = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
        var model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
