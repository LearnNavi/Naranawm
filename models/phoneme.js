'use strict';
module.exports = function (sequelize, DataTypes) {
    const Phoneme = sequelize.define('Phoneme', {
        ipa: { type: DataTypes.STRING, allowNull: false }
    });

    Phoneme.associate = function (models) {
        // associations can be defined here
        Phoneme.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        Phoneme.belongsToMany(models.Grapheme, {
            through: "GraphemePhonemeCorrespondence"
        });
    };

    return Phoneme;
};
