'use strict';
module.exports = function (sequelize, DataTypes) {
    var DictionaryBlock = sequelize.define('DictionaryBlock', {
        id: { type: DataTypes.INTEGER, primaryKey: true },
        description: { type: DataTypes.STRING }
    });

    DictionaryBlock.associate = function (models) {
        // associations can be defined here
        DictionaryBlock.hasMany(models.Entry, {
            onDelete: 'CASCADE'
        });
    };

    return DictionaryBlock;
};

/*
 0 => 'Main Block',
 1 => 'Invalid Words Block',
 2 => 'Infixes Block',
 3 => 'Noun Inflections Block',
 4 => 'Other noun inflections block',
 5 => 'English Shorthand Terms Block [DEPRECATED]',
 6 => 'Proper Nouns Block',
 7 => 'Proper Nouns Block (Flora)',
 8 => 'Proper Nouns Block (Fauna)',
 9 => 'Loaned Words Block',
 10 => 'Phrases Block',
 11 => 'Derivational Morph Block',
 -1 => 'EE Data'
 */