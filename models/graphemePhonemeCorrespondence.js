'use strict';
module.exports = function (sequelize, DataTypes) {
    const GraphemePhonemeCorrespondence = sequelize.define('GraphemePhonemeCorrespondence', {

    });

    GraphemePhonemeCorrespondence.removeAttribute('id');

    GraphemePhonemeCorrespondence.associate = function (models) {
        // associations can be defined here
        GraphemePhonemeCorrespondence.belongsTo(models.Grapheme, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        GraphemePhonemeCorrespondence.belongsTo(models.Phoneme, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    return GraphemePhonemeCorrespondence;
};
