"use strict";

const fs        = require("fs");
const path      = require("path");
const Sequelize = require("sequelize");
const cacher    = require("sequelize-redis-cache");
const redis     = require("redis");
const config = require("../config");

const sequelize = new Sequelize(config.databases.naranawm);
const rc        = redis.createClient(6379, 'localhost');
const db        = {};

fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js") && (file !== "sqlite.js");
    })
    .forEach(function(file) {
        const model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
        db[model.name].cache = cacher(sequelize, rc).model(model.name).ttl(120);
    });

Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
