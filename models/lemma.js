'use strict';
const format = require('string-format');

module.exports = function (sequelize, DataTypes) {
    const Lemma = sequelize.define('Lemma', {
        pubId: { type: DataTypes.INTEGER },
        lemma: { type: DataTypes.STRING, allowNull: false },
        ipa: { type: DataTypes.STRING },
        audio: { type: DataTypes.STRING },
        // This is for keeping track of lemmas that may have been created for this language,
        // but were either created in error, or by those not authorized to create new lemmas for the language
        // This flag lets us document them for completeness, but lets us filter them out
        rejected: { type: DataTypes.BOOLEAN, defaultValue: false },
        // Using legacy status to indicate a "lemma" from EE, but it isn't actually a lemma
        // This is a stop gap measure to get things working from EE until the data is properly
        // migrated into the new structure
        legacyLemma: { type: DataTypes.BOOLEAN, defaultValue: false },
        odd: { type: DataTypes.STRING }
    });

    Lemma.beforeCreate((user, options, callback) => {

        callback();
    });

    Lemma.associate = function (models) {
        // associations can be defined here
        Lemma.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        Lemma.hasMany(models.LemmaDefinition, {
            onDelete: 'CASCADE',
            as: "LemmaDefinition"
        });
        Lemma.belongsTo(models.Source, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        Lemma.belongsTo(models.DictionaryBlock, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        Lemma.belongsTo(models.EntryType, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        Lemma.belongsTo(models.Grapheme, {
            foreignKey: {
                allowNull: true
            },
            constraints: true,
            onDelete: 'cascade'
        });
        Lemma.belongsToMany(models.LemmaClassType, {
            through: "LemmaClassTypeAssociations",
            as: "LemmaClassTypes"
        });
        Lemma.hasMany(models.LinkedLemma, {
            onDelete: 'CASCADE',
            as: "LinkedLemma"
        });
    };

    Lemma.prototype.getFormattedDefinition = function(type, lc){
        const self = this;
        return new Promise(function(resolve, reject){
            if(self.LemmaDefinition.length === 1){
                // Expected case... assuming we only allow a single definition
                const definition = self.LemmaDefinition[0];
                //console.log(definition.text);

                const lemmaClassTypes = [];
                for(let i = 0; i < self.LemmaClassTypes.length; i++){
                    lemmaClassTypes.push(self.LemmaClassTypes[i].abbreviation);
                }


                const localMetadata = {};
                for(let i = 0; i < self.EntryType.Metadata.length; i++){
                    localMetadata[self.EntryType.Metadata[i].id] = self.EntryType.Metadata[i].get({plain: true}).LocalizedMetadata[0].value;
                }

                const layouts = {};
                const promises = [];
                for(let i = 0; i < self.EntryType.EntryTypeLayout.length; i++){
                    const entryLayout = self.EntryType.EntryTypeLayout[i];//.get({plain:true});
                    if(layouts[entryLayout.EntryLayout.id] === undefined){
                        layouts[entryLayout.EntryLayout.id] = {};
                    }

                    promises.push(entryLayout.EntryLayout.getFormattedLayout(type).then(function(formatString){
                        layouts[entryLayout.EntryLayout.id][i] = formatString;
                    }));
                }

                Promise.all(promises).then(function(){
                    for(let i = 0; i < self.LinkedLemma.length; i++){
                        const linkedDef = {
                            lemma: self.LinkedLemma[i].ReferencesLemma.lemma,
                            definition: self.LinkedLemma[i].ReferencesLemma.LemmaDefinition[0].get({plain: true}).text
                        };
                        if(layouts["SUB_ENTRY_LEMMA_DEF"] !== undefined && layouts["SUB_ENTRY_LEMMA_DEF"][i] !== undefined){
                            layouts["SUB_ENTRY_LEMMA_DEF"][i] = format(layouts["SUB_ENTRY_LEMMA_DEF"][i], linkedDef);
                        }

                    }

                    self.EntryType.getFormattedLayout(type).then(function (formatString) {
                        const formatData = {
                            lemma: self.lemma,
                            ipa: self.ipa,
                            source: self.Source.name,
                            lemma_class: lemmaClassTypes.join(", "),
                            definition: definition.text,
                            METADATA: localMetadata,
                            LAYOUTS: layouts
                        };
                        //console.log(formatData);
                        resolve(format(formatString, formatData));
                    });
                });

                /*promises.push(definition.getFormattedLayout(type).then(function(formattedDefinition){
                 console.log(formattedDefinition);
                 definitions[i] = formattedDefinition;
                 }));*/
            } else {
                console.log("Missing Definition!", lemma.id);
                resolve();
            }
        });

    };

    return Lemma;
};
