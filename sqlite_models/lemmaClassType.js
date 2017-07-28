'use strict';
module.exports = function (sequelize, DataTypes) {
    const LemmaClassType = sequelize.define('LemmaClassType', {
        id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        abbreviation: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true }
    });

    LemmaClassType.associate = function (models) {
        // associations can be defined here
        LemmaClassType.belongsToMany(models.Lemma, {
            through: "LemmaClassTypeAssociations"
        });
    };

    return LemmaClassType;
};
