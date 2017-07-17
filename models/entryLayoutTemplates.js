'use strict';
module.exports = function (sequelize, DataTypes) {
    const EntryLayoutTemplates = sequelize.define('EntryLayoutTemplates', {
        position: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 0 },
        field: { type: DataTypes.STRING, primaryKey: true }
    });

    EntryLayoutTemplates.associate = function (models) {
        // associations can be defined here
        EntryLayoutTemplates.belongsTo(models.EntryTemplate, {

        });

        EntryLayoutTemplates.belongsTo(models.EntryLayout, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });
    };

    return EntryLayoutTemplates;
};
