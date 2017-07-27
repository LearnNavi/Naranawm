'use strict';
module.exports = function (sequelize, DataTypes) {
    const Source = sequelize.define('Source', {
        name: { type: DataTypes.STRING, unique: true },
        description: DataTypes.STRING
    });

    Source.associate = function (models) {
        // associations can be defined here
        Source.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });

        Source.hasMany(models.Lemma, {
            onDelete: 'CASCADE'
        });

        Source.hasMany(models.Morpheme, {
            onDelete: 'CASCADE'
        });
    };

    return Source;
};
