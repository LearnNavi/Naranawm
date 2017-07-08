'use strict';
module.exports = function (sequelize, DataTypes) {
    var Entry = sequelize.define('Entry', {
        lemma: { type: DataTypes.STRING, allowNull: false },
        ipa: { type: DataTypes.STRING, allowNull: false },
        partOfSpeech: { type: DataTypes.STRING, allowNull: false },
        odd: { type: DataTypes.STRING },
        audio: { type: DataTypes.STRING }
    });

    Entry.associate = function (models) {
        // associations can be defined here
        Entry.hasMany(models.LocalizedEntry);
        Entry.belongsTo(models.Source);
    };

    return Entry;
};
