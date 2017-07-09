'use strict';
module.exports = function (sequelize, DataTypes) {
    var Language = sequelize.define('Language', {
        isoCode: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
        isoName: DataTypes.STRING,
        nativeName: DataTypes.STRING,
        active: DataTypes.BOOLEAN
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