'use strict';
module.exports = function (sequelize, DataTypes) {
    const DictionaryBlock = sequelize.define('DictionaryBlock', {
        id: { type: DataTypes.INTEGER, primaryKey: true },
        description: { type: DataTypes.STRING },
        useGraphemeHeaders: { type: DataTypes.BOOLEAN, default: false }
    });

    DictionaryBlock.associate = function (models) {
        // associations can be defined here
        DictionaryBlock.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        DictionaryBlock.hasMany(models.Lemma, {
            onDelete: 'CASCADE'
        });
    };

    DictionaryBlock.prototype.getFormattedBlock = function(type, lc) {
        const self = this;
        return new Promise(function(resolve, reject){
            self.getLemmas({
                include: [
                    {
                        association: "LemmaDefinition",
                        where: {
                            LanguageIsoCode: lc
                        }
                    },{
                        association: "Source"
                    }, {
                        association: "EntryType",
                        include: [{
                            association: "Metadata",
                            include: [{
                                association: "LocalizedMetadata",
                                where: {
                                    LanguageIsoCode: lc
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
                            LanguageIsoCode: lc
                        }
                    }, {
                        association: "LinkedLemma",
                        include: [{
                            association: "ReferencesLemma",
                            include: [{
                                association: "LemmaDefinition",
                                where: {
                                    LanguageIsoCode: lc
                                }
                            }]
                        }]
                    }

                ], where: {
                    LanguageIsoCode: self.LanguageIsoCode
                }
            }).then(function(lemmas){
                console.log("Got Lemmas");
                const definitions = new Array(lemmas.length);
                const promises = [];
                for(let i = 0; i < lemmas.length; i++){
                    promises.push(lemmas[i].getFormattedDefinition(type, lc).then(function(formattedDefinition){
                        definitions[i] = formattedDefinition;
                        console.log(formattedDefinition);
                    }));
                }
                console.log("Length: ", promises.length);

                Promise.all(promises).then(function(){
                    //resolve();
                    resolve(definitions.join('\n'));
                });
            });
        });
    };

    return DictionaryBlock;
};
