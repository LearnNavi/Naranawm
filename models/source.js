'use strict';
module.exports = function (sequelize, DataTypes) {
    const Source = sequelize.define('Source', {
        name: { type: DataTypes.STRING },
        description: DataTypes.STRING
    }, {
        indexes: [{
            unique: true,
            fields: ["name", "LanguageIsoCode"]
        }]
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
        Source.hasMany(models.Lemma);
        Source.hasMany(models.Morpheme);
    };

    return Source;
};
