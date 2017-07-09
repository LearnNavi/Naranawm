'use strict';
module.exports = function (sequelize, DataTypes) {
    var Entry = sequelize.define('Entry', {
        pubId: { type: DataTypes.INTEGER },
        lemma: { type: DataTypes.STRING, allowNull: false },
        ipa: { type: DataTypes.STRING },
        audio: { type: DataTypes.STRING }
    });

    Entry.associate = function (models) {
        // associations can be defined here
        Entry.hasMany(models.LocalizedEntry, {
            onDelete: 'CASCADE'
        });
        Entry.belongsTo(models.Source, {
            onDelete: 'CASCADE'
        });
    };

    return Entry;
};
