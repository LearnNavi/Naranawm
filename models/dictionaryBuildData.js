'use strict';
module.exports = function (sequelize, DataTypes) {
    const DictionaryBuildData = sequelize.define('DictionaryBuildData', {
        position: { type: DataTypes.INTEGER, allowNull: false },
        type: { type: DataTypes.STRING},
    });

    DictionaryBuildData.associate = function (models) {
        // associations can be defined here
        DictionaryBuildData.belongsTo(models.DictionaryBuild, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        DictionaryBuildData.belongsTo(models.Language, {
            foreignKey: {
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
