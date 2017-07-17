'use strict';
module.exports = function (sequelize, DataTypes) {
    const EntryTypeTemplates = sequelize.define('EntryTypeTemplates', {
        position: { type: DataTypes.INTEGER, primaryKey: true, defaultValue: 0 },
        field: { type: DataTypes.STRING, primaryKey: true }
    });

    EntryTypeTemplates.associate = function (models) {
        // associations can be defined here
        EntryTypeTemplates.belongsTo(models.EntryTemplate, {

        });

        EntryTypeTemplates.belongsTo(models.EntryType, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });
    };

    return EntryTypeTemplates;
};
