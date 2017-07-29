'use strict';
module.exports = function (sequelize, DataTypes) {
    const EntryTemplate = sequelize.define('EntryTemplate', {
        id: { type: DataTypes.STRING, primaryKey: true },
        latex: { type: DataTypes.STRING, allowNull: false, defaultValue: "" },
        html: { type: DataTypes.STRING, allowNull: false, defaultValue: "" }
    });

    EntryTemplate.associate = function (models) {
        // associations can be defined here
        EntryTemplate.belongsToMany(models.EntryLayout, {
            through: {
                model: models.EntryLayoutTemplates,
                unique: false
            }
        });
    };

    return EntryTemplate;
};
