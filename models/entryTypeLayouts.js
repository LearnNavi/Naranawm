'use strict';
module.exports = function (sequelize, DataTypes) {
    const EntryTypeLayout = sequelize.define('EntryTypeLayout', {
        order: { type: DataTypes.INTEGER, allowNull: false }
    });

    EntryTypeLayout.associate = function (models) {
        // associations can be defined here
        EntryTypeLayout.belongsTo(models.EntryType, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        EntryTypeLayout.belongsTo(models.EntryLayout, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    return EntryTypeLayout;
};
