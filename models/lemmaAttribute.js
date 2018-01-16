'use strict';
module.exports = function (sequelize, DataTypes) {
    const LemmaAttribute = sequelize.define('LemmaAttribute', {
        name: { type: DataTypes.STRING, allowNull: false },
        abbreviation: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: true }
    });

    LemmaAttribute.associate = function (models) {
        // associations can be defined here
        LemmaAttribute.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });

        LemmaAttribute.belongsToMany(models.Lemma, {
            through: "LemmaAttributeAssociations"
        });
    };

    return LemmaAttribute;
};
