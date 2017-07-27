'use strict';
module.exports = function (sequelize, DataTypes) {
    const LemmaClassTypeAssociation = sequelize.define('LemmaClassTypeAssociation', {

    });

    LemmaClassTypeAssociation.removeAttribute('id');

    LemmaClassTypeAssociation.associate = function (models) {
        // associations can be defined here
        LemmaClassTypeAssociation.belongsTo(models.Lemma);

        LemmaClassTypeAssociation.belongsTo(models.LemmaClassType);
    };

    return LemmaClassTypeAssociation;
};
