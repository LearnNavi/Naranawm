'use strict';
module.exports = function (sequelize, DataTypes) {
    const LocalizedEntryLayout = sequelize.define('LocalizedEntryLayout', {
        layout: { type: DataTypes.STRING, allowNull: false },
        argc: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        changeable: { type: DataTypes.STRING, allowNull: false, defaultValue: "" }
    });

    LocalizedEntryLayout.associate = function (models) {
        // associations can be defined here
        LocalizedEntryLayout.belongsTo(models.EntryType, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });
        LocalizedEntryLayout.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });
    };

    return LocalizedEntryLayout;
};
