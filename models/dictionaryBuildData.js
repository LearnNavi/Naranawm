'use strict';
module.exports = function (sequelize, DataTypes) {
    const DictionaryBuildData = sequelize.define('DictionaryBuildData', {
        position: { type: DataTypes.INTEGER, primaryKey: true },
        type: { type: DataTypes.STRING},
        data: { type: DataTypes.TEXT, allowNull: true }
    });

    DictionaryBuildData.associate = function (models) {
        // associations can be defined here
        DictionaryBuildData.belongsTo(models.DictionaryBuild, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        DictionaryBuildData.belongsTo(models.Language, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        DictionaryBuildData.belongsTo(models.DictionaryBlock, {
            foreignKey: {
                allowNull: true
            }
        });

        DictionaryBuildData.belongsTo(models.DictionaryTemplate, {
            foreignKey: {
                allowNull: true
            }
        });

    };

    return DictionaryBuildData;
};
