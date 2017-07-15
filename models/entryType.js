'use strict';
var Promise = require('bluebird');

module.exports = function (sequelize, DataTypes) {
    var EntryType = sequelize.define('EntryType', {
        id: { type: DataTypes.STRING, primaryKey: true },
        layout: { type: DataTypes.STRING, allowNull: false },
        argc: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        changeable: { type: DataTypes.STRING, allowNull: false, defaultValue: "" }
    });

    EntryType.associate = function (models) {
        EntryType.belongsTo(models.EntryLayout, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'CASCADE'
        });

        EntryType.belongsToMany(models.Entry, {
            through: {
                model: models.EntryTypeEntries,
                unique: false
            },
            primaryKey: true
        });
    };

    EntryType.prototype.getLatex = function (){
        var self = this;
        return new Promise(function(resolve, reject){
            self.getEntryLayout().then(function(layout){
                layout.getLatex(self.layout).then(function(latex){
                    resolve(latex);
                });
            });
        });
    };

    EntryType.prototype.getHtml = function (){
        var self = this;
        return new Promise(function(resolve, reject){
            self.getEntryLayout().then(function(layout){
                layout.getHtml(self.layout).then(function(html){
                    resolve(html);
                });
            });
        });
    };

    return EntryType;
};
