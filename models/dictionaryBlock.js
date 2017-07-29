'use strict';
module.exports = function (sequelize, DataTypes) {
    const DictionaryBlock = sequelize.define('DictionaryBlock', {
        id: { type: DataTypes.INTEGER, primaryKey: true },
        description: { type: DataTypes.STRING }
    });

    DictionaryBlock.associate = function (models) {
        // associations can be defined here
        DictionaryBlock.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        DictionaryBlock.hasMany(models.Lemma, {
            onDelete: 'CASCADE'
        });
    };

    return DictionaryBlock;
};
