'use strict';
module.exports = function (sequelize, DataTypes) {
    const LemmaAttributeAssociation = sequelize.define('LemmaAttributeAssociation', {
        notes: { type: DataTypes.STRING }
    });

    LemmaAttributeAssociation.removeAttribute('id');

    LemmaAttributeAssociation.associate = function (models) {
        // associations can be defined here
        LemmaAttributeAssociation.belongsTo(models.Lemma, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        LemmaAttributeAssociation.belongsTo(models.LemmaAttribute, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    return LemmaAttributeAssociation;
};
