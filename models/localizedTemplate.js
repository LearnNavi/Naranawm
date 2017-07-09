'use strict';
module.exports = function (sequelize, DataTypes) {
    var LocalizedTemplate = sequelize.define('LocalizedTemplate', {
        id: { type: DataTypes.STRING, primaryKey: true },
        format: { type: DataTypes.STRING, allowNull: false },
        argc: { type: DataTypes.INTEGER, allowNull: false },
        changeable: { type: DataTypes.STRING, allowNull: false }
    });

    LocalizedTemplate.associate = function (models) {
        // associations can be defined here
        LocalizedTemplate.belongsTo(models.Template, {
            onDelete: 'CASCADE'
        })
    };

    return LocalizedTemplate;
};