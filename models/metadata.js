'use strict';
module.exports = function (sequelize, DataTypes) {
    const Metadata = sequelize.define('Metadata', {
        id: { type: DataTypes.STRING, primaryKey: true }
    });

    Metadata.associate = function (models) {
        // associations can be defined here
        Metadata.hasMany(models.LocalizedMetadata, {
            onDelete: 'CASCADE'
        });

        Metadata.belongsToMany(models.EntryType, {
            through: 'EntryTypeMetadata'
        });
    };

    return Metadata;
};
