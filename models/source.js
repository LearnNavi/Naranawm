'use strict';
module.exports = function (sequelize, DataTypes) {
    var Source = sequelize.define('Source', {
        name: { type: DataTypes.STRING, unique: true },
        description: DataTypes.STRING
    });

    Source.associate = function (models) {
        // associations can be defined here
        Source.hasMany(models.Entry);
    };

    return Source;
};
