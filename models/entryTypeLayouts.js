'use strict';
module.exports = function (sequelize, DataTypes) {
    const EntryTypeLayout = sequelize.define('EntryTypeLayout', {
        order: { type: DataTypes.INTEGER, primaryKey: true }
    });

    EntryTypeLayout.removeAttribute('id');

    EntryTypeLayout.associate = function (models) {
        // associations can be defined here
        EntryTypeLayout.belongsTo(models.EntryType, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        EntryTypeLayout.belongsTo(models.EntryLayout, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    return EntryTypeLayout;
};
