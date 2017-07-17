'use strict';
module.exports = function (sequelize, DataTypes) {
    const Language = sequelize.define('Language', {
        isoCode: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
        isoName: { type: DataTypes.STRING, allowNull: false },
        nativeName: { type: DataTypes.STRING, allowNull: false },
        active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        export: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
    });

    Language.associate = function (models) {
        // associations can be defined here
        Language.hasMany(models.LocalizedEntry, {
            onDelete: 'CASCADE'
        });
        Language.hasMany(models.PartOfSpeech, {
            onDelete: 'CASCADE'
        });
    };

    return Language;
};