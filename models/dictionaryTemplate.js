'use strict';
module.exports = function (sequelize, DataTypes) {
    const DictionaryTemplate = sequelize.define('DictionaryTemplate', {
        id: { type: DataTypes.STRING, primaryKey: true },
        latex: { type: DataTypes.TEXT, allowNull: false },
        html: { type: DataTypes.TEXT, allowNull: false },
        placeholders: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
    });

    DictionaryTemplate.associate = function (models) {
        // associations can be defined here
        DictionaryTemplate.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false,
                primaryKey: true
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    return DictionaryTemplate;
};
