'use strict';
module.exports = function (sequelize, DataTypes) {
    const EntryLayoutTemplates = sequelize.define('EntryLayoutTemplates', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        position: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        field: { type: DataTypes.STRING, allowNull: false }
    });

    EntryLayoutTemplates.associate = function (models) {
        // associations can be defined here
        EntryLayoutTemplates.belongsTo(models.EntryTemplate, {

        });

        EntryLayoutTemplates.belongsTo(models.EntryLayout, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });
    };

    return EntryLayoutTemplates;
};
