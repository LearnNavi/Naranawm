'use strict';

module.exports = function (sequelize, DataTypes) {
    const MorphemeAffixType = sequelize.define('MorphemeAffixType', {
        id: { type: DataTypes.STRING, primaryKey: true }
    });

    MorphemeAffixType.associate = function (models) {
        // associations can be defined here
        MorphemeAffixType.hasMany(models.Morpheme, {
            onDelete: 'CASCADE'
        });

    };

    return MorphemeAffixType;
};
