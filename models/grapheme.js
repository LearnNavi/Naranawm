'use strict';
module.exports = function (sequelize, DataTypes) {
    const Grapheme = sequelize.define('Grapheme', {
        id: { type: DataTypes.STRING, primaryKey: true },
        sortOrder: { type: DataTypes.INTEGER, allowNull: false }
    });

    Grapheme.associate = function (models) {
        // associations can be defined here
        Grapheme.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false,
                primaryKey: true
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
