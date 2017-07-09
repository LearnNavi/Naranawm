'use strict';
module.exports = function (sequelize, DataTypes) {
    var Template = sequelize.define('Template', {
        id: { type: DataTypes.STRING, primaryKey: true },
        format: { type: DataTypes.STRING, allowNull: false },
        argc: { type: DataTypes.INTEGER, allowNull: false },
        changeable: { type: DataTypes.STRING, allowNull: false }
    });

    Template.associate = function (models) {
        // associations can be defined here

    };

    return Template;
};
