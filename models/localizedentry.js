'use strict';
var format = require('string-format');
var Promise = require('bluebird');
var models = require('./index');

module.exports = function (sequelize, DataTypes) {
    var LocalizedEntry = sequelize.define('LocalizedEntry', {
        odd: DataTypes.TEXT
    });

    LocalizedEntry.removeAttribute('id');

    LocalizedEntry.associate = function (models) {
        // associations can be defined here
        LocalizedEntry.belongsTo(models.Entry, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        LocalizedEntry.belongsTo(models.Language, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        LocalizedEntry.belongsTo(models.PartOfSpeech, {
            onDelete: 'cascade'
        });
    };

    LocalizedEntry.prototype.getFormattedlayout = function(type){
        var self = this;
        return new Promise(function (resolve, reject) {
            self.getEntry().then(function(entry){
                entry.getSource().then(function(source){
                    entry.getEntryType().then(function(entryType) {
                        entryType.getMetadata().then(function(metadata){
                            var promises = [];
                            var localMetadata = {};
                            metadata.forEach(function(m){
                                promises.push(m.getLocalizedMetadata({where: {LanguageIsoCode: self.LanguageIsoCode}}).then(function(localizedMetadata){
                                    localizedMetadata.forEach(function(l){
                                        localMetadata[l.MetadatumId] = l.getDataValue('value');
                                    })
                                }));
                            });

                            Promise.all(promises).then(function(){
                                entryType.getFormattedLayout(type).then(function (formatString) {
                                    //console.log(formatString);
                                    var formatData = {
                                        lemma: entry.lemma,
                                        ipa: entry.ipa,
                                        source: source.name,
                                        partOfSpeech: 'not implemented',
                                        definition: 'not implemented',
                                        METADATA: localMetadata,
                                        LAYOUTS: {}
                                    };
                                    //console.log(formatData);
                                    resolve(format(formatString, formatData));
                                });
                            });
                        });
                    });
                });
            });
        });
    };

    LocalizedEntry.prototype.getHtml = function() {
        return this.getFormattedlayout("html");
    };

    LocalizedEntry.prototype.getLatex = function() {
        return this.getFormattedlayout("latex");
    };

    return LocalizedEntry;
};