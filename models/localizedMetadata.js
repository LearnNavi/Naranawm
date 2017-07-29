'use strict';
module.exports = function (sequelize, DataTypes) {

    const LocalizedMetadata = sequelize.define('LocalizedMetadata', {
        value: { type: DataTypes.TEXT, allowNull: false }
    });

    LocalizedMetadata.associate = function (models) {
        // associations can be defined here
        LocalizedMetadata.belongsTo(models.Metadata, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        LocalizedMetadata.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    return LocalizedMetadata;
};