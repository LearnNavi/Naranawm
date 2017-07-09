'use strict';
module.exports = function (sequelize, DataTypes) {
    var LocalizedTemplate = sequelize.define('LocalizedTemplate', {
        format: { type: DataTypes.STRING, allowNull: false },
        argc: { type: DataTypes.INTEGER, allowNull: false },
        changeable: { type: DataTypes.STRING, allowNull: false }
    });

    LocalizedTemplate.removeAttribute('id');

    LocalizedTemplate.associate = function (models) {
        // associations can be defined here
        LocalizedTemplate.belongsTo(models.Template, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });
        LocalizedTemplate.belongsTo(models.Language, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });
    };

    return LocalizedTemplate;
};