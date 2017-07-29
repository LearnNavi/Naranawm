'use strict';
module.exports = function (sequelize, DataTypes) {
    const DictionaryBuild = sequelize.define('DictionaryBuild', {
        name: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING }
    });

    DictionaryBuild.associate = function (models) {
        // associations can be defined here
        DictionaryBuild.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        DictionaryBuild.hasMany(models.DictionaryBuildData, {
            onDelete: 'CASCADE'
        });
    };

    return DictionaryBuild;
};
