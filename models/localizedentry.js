'use strict';
module.exports = function (sequelize, DataTypes) {
    var LocalizedEntry = sequelize.define('LocalizedEntry', {
        lc: { type: DataTypes.STRING, allowNull: false },
        test: DataTypes.INTEGER
    }, {
        classMethods: {
            associate: function (models) {
                // associations can be defined here
                console.log("This is being called...");
                LocalizedEntry.belongsTo(models.Entry);
            }
        }
    });
    return LocalizedEntry;
};