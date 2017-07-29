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
            self.getLemma({
                include: [
                    {
                        association: "Source"
                    }, {
                        association: "EntryType",
                        include: [{
                            association: "Metadata",
                            include: [{
                                association: "LocalizedMetadata",
                                where: {
                                    LanguageIsoCode: self.LanguageIsoCode
                                }
                            }]
                        },{
                            association: "EntryTypeLayout",
                            include: [{
                                association: "EntryLayout"
                            }]
                        }]
                    }, {
                        association: "LemmaClassTypes",
                        through: "LemmaClassTypeAssociations",
                        where: {
                            LanguageIsoCode: self.LanguageIsoCode
                        }
                    }, {
                        association: "LinkedLemma",
                        include: [{
                            association: "ReferencesLemma",
                            include: [{
                                association: "LemmaDefinition",
                                where: {
                                    LanguageIsoCode: self.LanguageIsoCode
                                }
                            }]
                        }]
                    }
                ]
            }).then(function(lemma){
                const lemmaClassTypes = [];
                for(let i = 0; i < lemma.LemmaClassTypes.length; i++){
                    lemmaClassTypes.push(lemma.LemmaClassTypes[i].abbreviation);
                }


                const localMetadata = {};
                for(let i = 0; i < lemma.EntryType.Metadata.length; i++){
                    localMetadata[lemma.EntryType.Metadata[i].id] = lemma.EntryType.Metadata[i].get({plain: true}).LocalizedMetadata[0].value;
                }

                const layouts = {};
                const promises = [];
                for(let i = 0; i < lemma.EntryType.EntryTypeLayout.length; i++){
                    const entryLayout = lemma.EntryType.EntryTypeLayout[i];//.get({plain:true});
                    if(layouts[entryLayout.EntryLayout.id] === undefined){
                        layouts[entryLayout.EntryLayout.id] = {};
                    }

                    promises.push(entryLayout.EntryLayout.getFormattedLayout(type).then(function(formatString){
                        layouts[entryLayout.EntryLayout.id][i] = formatString;
                    }));
                }

                Promise.all(promises).then(function(){
                    for(let i = 0; i < lemma.LinkedLemma.length; i++){
                        const linkedDef = {
                            lemma: lemma.LinkedLemma[i].ReferencesLemma.lemma,
                            definition: lemma.LinkedLemma[i].ReferencesLemma.LemmaDefinition[0].get({plain: true}).text
                        };
                        if(layouts["SUB_ENTRY_LEMMA_DEF"] !== undefined && layouts["SUB_ENTRY_LEMMA_DEF"][i] !== undefined){
                            layouts["SUB_ENTRY_LEMMA_DEF"][i] = format(layouts["SUB_ENTRY_LEMMA_DEF"][i], linkedDef);
                        }

                    }

                    lemma.EntryType.getFormattedLayout(type).then(function (formatString) {
                        const formatData = {
                            lemma: lemma.lemma,
                            ipa: lemma.ipa,
                            source: lemma.Source.name,
                            lemma_class: lemmaClassTypes.join(", "),
                            definition: self.text,
                            METADATA: localMetadata,
                            LAYOUTS: layouts
                        };
                        //console.log(formatData);
                        resolve(format(formatString, formatData));
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