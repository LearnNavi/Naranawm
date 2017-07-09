'use strict';
module.exports = function (sequelize, DataTypes) {
    var PartOfSpeech = sequelize.define('PartOfSpeech', {
        type: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
        description: { type: DataTypes.STRING, allowNull: true }
    }, {
        freezeTableName: true,
        tableName: "PartsOfSpeech"
    });

    PartOfSpeech.associate = function (models) {
        // associations can be defined here
        PartOfSpeech.belongsTo(models.Language, {
            foreignKey: {
                primaryKey: true,
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });
    };

    return PartOfSpeech;
};
