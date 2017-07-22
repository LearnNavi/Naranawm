'use strict';
module.exports = function (sequelize, DataTypes) {
    const Lexeme = sequelize.define('Lexeme', {
        lexeme: { type: DataTypes.STRING, unique: true }

    });

    Lexeme.associate = function (models) {
        // associations can be defined here

    };

    return Lexeme;
};
