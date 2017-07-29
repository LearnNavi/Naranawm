'use strict';
module.exports = function (sequelize, DataTypes) {
    const LinkedLemma = sequelize.define('LinkedLemma', {
        order: { type: DataTypes.INTEGER, allowNull: false },
        note: { type: DataTypes.STRING, allowNull: true }
    });

    LinkedLemma.associate = function (models) {
        // associations can be defined here
        LinkedLemma.belongsTo(models.Lemma, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        LinkedLemma.belongsTo(models.Lemma, {
            as: "ReferencesLemma",
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
    };

    return LinkedLemma;
};
