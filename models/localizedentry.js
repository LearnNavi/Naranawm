'use strict';
module.exports = function (sequelize, DataTypes) {
    var LocalizedEntry = sequelize.define('LocalizedEntry', {
        odd: DataTypes.STRING
    });

    LocalizedEntry.removeAttribute('id');

    LocalizedEntry.associate = function (models) {
        // associations can be defined here
        LocalizedEntry.belongsTo(models.Entry, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        LocalizedEntry.belongsTo(models.Language, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        LocalizedEntry.belongsTo(models.PartOfSpeech, {
            onDelete: 'cascade'
        });
    };

    return LocalizedEntry;
};