"use strict";

const fs        = require("fs");
const path      = require("path");
const Sequelize = require("sequelize");

const tmp = require('tmp');

module.exports = function(){
    const config = require("../config");
    const tmpobj = tmp.fileSync({ mode: "0644", prefix: 'database-', postfix: '.sqlite' });
    config.databases.sqlite.storage = tmpobj.name;
    const sequelize = new Sequelize(config.databases.sqlite);

    const db        = {};

    fs
        .readdirSync(__dirname)
        .filter(function(file) {
            return (file.indexOf(".") !== 0) && (file !== "index.js") && (file !== "sqlite.js");
        })
        .forEach(function(file) {
            const model = sequelize.import(path.join(__dirname, file));
            db[model.name] = model;
        });

    Object.keys(db).forEach(function(modelName) {
        if ("associate" in db[modelName]) {
            db[modelName].associate(db);
        }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
    db.file = tmpobj.name;

    return db;
};
