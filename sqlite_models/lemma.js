'use strict';

module.exports = function (sequelize, DataTypes) {
    const Lemma = sequelize.define('Lemma', {
        pubId: { type: DataTypes.INTEGER },
        lemma: { type: DataTypes.STRING, allowNull: false },
        ipa: { type: DataTypes.STRING },
        audio: { type: DataTypes.STRING },
        // This is for keeping track of lemmas that may have been created for this language,
        // but were either created in error, or by those not authorized to create new lemmas for the language
        // This flag lets us document them for completeness, but lets us filter them out
        invalid: { type: DataTypes.BOOLEAN, defaultValue: false }
    });

    Lemma.associate = function (models) {
        // associations can be defined here
        Lemma.hasMany(models.LemmaDefinition, {
            onDelete: 'CASCADE'
        });
        Lemma.belongsTo(models.Source, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        Lemma.belongsToMany(models.LemmaClassType, {
            through: "LemmaClassTypeAssociations"
        });
    };

    return Lemma;
};
