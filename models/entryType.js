'use strict';
module.exports = function (sequelize, DataTypes) {
    var EntryType = sequelize.define('EntryType', {
        id: { type: DataTypes.STRING, primaryKey: true },
        layout: { type: DataTypes.STRING, allowNull: false },
        argc: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        changeable: { type: DataTypes.STRING, allowNull: false, defaultValue: "" }
    });

    EntryType.associate = function (models) {
        EntryType.belongsTo(models.EntryLayout, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });
    };

    return EntryType
};
