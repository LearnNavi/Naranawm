'use strict';
module.exports = function (sequelize, DataTypes) {
    const Grapheme = sequelize.define('Grapheme', {
        id: { type: DataTypes.STRING, primaryKey: true },
        sortOrder: { type: DataTypes.INTEGER, allowNull: false }
    });

    Grapheme.associate = function (models) {
        // associations can be defined here
        Grapheme.belongsToMany(models.Phoneme, {
            through: "GraphemePhonemeCorrespondence"
        });

    };

    return Grapheme;
};
