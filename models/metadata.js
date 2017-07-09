'use strict';
module.exports = function (sequelize, DataTypes) {
    var Metadata = sequelize.define('Metadata', {
        id: { type: DataTypes.STRING, primaryKey: true }
    });

    Metadata.associate = function (models) {
        // associations can be defined here
        Metadata.hasMany(models.LocalizedMetadata, {
            onDelete: 'CASCADE'
        });
    };

    return Metadata;
};
