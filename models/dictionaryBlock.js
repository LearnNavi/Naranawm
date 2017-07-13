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
