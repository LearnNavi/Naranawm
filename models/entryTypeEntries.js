'use strict';
module.exports = function (sequelize, DataTypes) {
    var EntryTypeEntries = sequelize.define('EntryTypeEntries', {
        position: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 0 }
    });

    EntryTypeEntries.associate = function (models) {
        // associations can be defined here
        EntryTypeEntries.belongsTo(models.EntryType, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });

        EntryTypeEntries.belongsTo(models.Entry, {

        });
    };

    return EntryTypeEntries;
};
