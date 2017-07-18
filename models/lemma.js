'use strict';

module.exports = function (sequelize, DataTypes) {
    const Lemma = sequelize.define('Lemma', {
        pubId: { type: DataTypes.INTEGER },
        lemma: { type: DataTypes.STRING, allowNull: false },
        ipa: { type: DataTypes.STRING },
        audio: { type: DataTypes.STRING }
    });

    Lemma.associate = function (models) {
        // associations can be defined here
        Lemma.hasMany(models.LocalizedDefinition, {
            onDelete: 'CASCADE'
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
    };

    return Lemma;
};
