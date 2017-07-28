'use strict';
module.exports = function (sequelize, DataTypes) {
    const Phoneme = sequelize.define('Phoneme', {
        id: { type: DataTypes.STRING, primaryKey: true },
        ipa: { type: DataTypes.STRING },
    });

    Phoneme.associate = function (models) {
        // associations can be defined here
        Phoneme.belongsToMany(models.Grapheme, {
            through: "GraphemePhonemeCorrespondence"
        });
    };

    return Phoneme;
};
