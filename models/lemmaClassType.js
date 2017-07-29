'use strict';
module.exports = function (sequelize, DataTypes) {
    const LemmaClassType = sequelize.define('LemmaClassType', {
        classType: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        abbreviation: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true }
    });

    LemmaClassType.associate = function (models) {
        // associations can be defined here
        LemmaClassType.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });

        LemmaClassType.belongsToMany(models.Lemma, {
            through: "LemmaClassTypeAssociations"
        });
    };

    return LemmaClassType;
};
