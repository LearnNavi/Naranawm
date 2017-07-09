'use strict';
module.exports = function (sequelize, DataTypes) {
    var LocalizedMetadata = sequelize.define('LocalizedMetadata', {
        value: { type: DataTypes.STRING, allowNull: false }
    });

    LocalizedMetadata.removeAttribute('id');

    LocalizedMetadata.associate = function (models) {
        // associations can be defined here
        LocalizedMetadata.belongsTo(models.Metadata, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        LocalizedMetadata.belongsTo(models.Language, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    return LocalizedMetadata;
};