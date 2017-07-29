'use strict';
module.exports = function (sequelize, DataTypes) {
    const LemmaClassTypeAssociation = sequelize.define('LemmaClassTypeAssociation', {

    });

    LemmaClassTypeAssociation.removeAttribute('id');

    LemmaClassTypeAssociation.associate = function (models) {
        // associations can be defined here
        LemmaClassTypeAssociation.belongsTo(models.Lemma, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        LemmaClassTypeAssociation.belongsTo(models.LemmaClassType, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    return LemmaClassTypeAssociation;
};
