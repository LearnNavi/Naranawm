'use strict';
module.exports = function (sequelize, DataTypes) {
    const Grapheme = sequelize.define('Grapheme', {
        grapheme: { type: DataTypes.STRING, allowNull: false },
        sortOrder: { type: DataTypes.INTEGER, allowNull: false }
    });

    Grapheme.associate = function (models) {
        // associations can be defined here
        Grapheme.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        Grapheme.belongsToMany(models.Phoneme, {
            through: "GraphemePhonemeCorrespondence"
        });

    };

    return Grapheme;
};
