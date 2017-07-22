'use strict';
const format = require('string-format');
const Promise = require('bluebird');
const models = require('./index');

module.exports = function (sequelize, DataTypes) {

    const LemmaDefinition = sequelize.define('LemmaDefinition', {
        text: DataTypes.TEXT,
        odd: DataTypes.TEXT
    });

    LemmaDefinition.removeAttribute('id');

    LemmaDefinition.associate = function (models) {
        // associations can be defined here
        LemmaDefinition.belongsTo(models.Lemma, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        LemmaDefinition.belongsTo(models.Language, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    LemmaDefinition.prototype.getFormattedlayout = function(type){
        const self = this;
        return new Promise(function (resolve, reject) {
            self.getLemma().then(function(lemma){
                console.log(lemma.get({plain: true}));
                lemma.getSource().then(function(source){
                    lemma.getEntryType().then(function(entryType) {
                        lemma.getLemmaClassTypes({where: {LanguageIsoCode: self.LanguageIsoCode}}).then(function(classTypes){
                            const lemmaClassTypes = [];
                            for(let i = 0; i < classTypes.length; i++){
                                lemmaClassTypes.push(classTypes[i].abbreviation);
                            }
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
                                            lemma_class: lemmaClassTypes.join(", "),
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
        });
    };

    LemmaDefinition.prototype.getHtml = function() {
        return this.getFormattedlayout("html");
    };

    LemmaDefinition.prototype.getLatex = function() {
        return this.getFormattedlayout("latex");
    };

    return LemmaDefinition;
};