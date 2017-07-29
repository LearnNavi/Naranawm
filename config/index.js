"use strict";
const env       = process.env.NODE_ENV || "development";

// If running in development mode, use the local config properties, otherwise pull in that environments config
module.exports = (env !== "development") ? require(`./${env}.vault`) : require('./local');
