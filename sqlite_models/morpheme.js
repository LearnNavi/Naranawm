'use strict';

module.exports = function (sequelize, DataTypes) {
    const Morpheme = sequelize.define('Morpheme', {
        pubId: { type: DataTypes.INTEGER },
        morpheme: { type: DataTypes.STRING, allowNull: false },
        ipa: { type: DataTypes.STRING },
        audio: { type: DataTypes.STRING },
        boundType: { type: DataTypes.ENUM("bound_derivational", "bound_inflectional", "free"), allowNull: true },
        productive: { type: DataTypes.BOOLEAN },
        eeType: { type: DataTypes.STRING } // Temporary Field for debugging (TODO: delete field once done)
    });

    Morpheme.associate = function (models) {
        // associations can be defined here
        Morpheme.hasMany(models.MorphemeDefinition, {
            onDelete: 'CASCADE'
        });

        Morpheme.belongsTo(models.Source, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        Morpheme.belongsTo(models.MorphemeAffixType, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    return Morpheme;
};
