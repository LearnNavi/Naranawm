'use strict';
const format = require('string-format');
const Promise = require('bluebird');
const models = require('./index');

module.exports = function (sequelize, DataTypes) {

    const LocalizedDefinition = sequelize.define('LocalizedDefinition', {
        odd: DataTypes.TEXT
    });

    LocalizedDefinition.removeAttribute('id');

    LocalizedDefinition.associate = function (models) {
        // associations can be defined here
        LocalizedDefinition.belongsTo(models.Lemma, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        LocalizedDefinition.belongsTo(models.Language, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        LocalizedDefinition.belongsTo(models.PartOfSpeech, {
            onDelete: 'cascade'
        });
    };

    LocalizedDefinition.prototype.getFormattedlayout = function(type){
        const self = this;
        return new Promise(function (resolve, reject) {
            self.getLemma().then(function(lemma){
                lemma.getSource().then(function(source){
                    lemma.getEntryType().then(function(entryType) {
                        entryType.getMetadata().then(function(metadata){
                            const promises = [];
                            const localMetadata = {};
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
                                    const formatData = {
                                        lemma: lemma.lemma,
                                        ipa: lemma.ipa,
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

    LocalizedDefinition.prototype.getHtml = function() {
        return this.getFormattedlayout("html");
    };

    LocalizedDefinition.prototype.getLatex = function() {
        return this.getFormattedlayout("latex");
    };

    return LocalizedDefinition;
};