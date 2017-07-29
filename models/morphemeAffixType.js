'use strict';

module.exports = function (sequelize, DataTypes) {
    const MorphemeAffixType = sequelize.define('MorphemeAffixType', {
        id: { type: DataTypes.STRING, primaryKey: true }
    });

    MorphemeAffixType.associate = function (models) {
        // associations can be defined here
        MorphemeAffixType.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        MorphemeAffixType.hasMany(models.Morpheme, {
            onDelete: 'CASCADE'
        });

    };

    return MorphemeAffixType;
};
