'use strict';
module.exports = function (sequelize, DataTypes) {
    const DictionaryBuild = sequelize.define('DictionaryBuild', {
        id: { type: DataTypes.STRING, primaryKey: true },
        description: { type: DataTypes.STRING }
    });

    DictionaryBuild.associate = function (models) {
        // associations can be defined here
        DictionaryBuild.hasMany(models.DictionaryBuildData, {
            onDelete: 'CASCADE'
        });
    };

    return DictionaryBuild;
};
