'use strict';
var Promise = require('bluebird');

module.exports = function (sequelize, DataTypes) {
    var EntryType = sequelize.define('EntryType', {
        id: { type: DataTypes.STRING, primaryKey: true },
        layout: { type: DataTypes.STRING, allowNull: true },
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

        EntryType.belongsToMany(models.Metadata, {
            through: 'EntryTypeMetadata',
            as: "Metadata"
        });
    };

    EntryType.prototype.getFormattedLayout = function(type){
        var self = this;
        return new Promise(function(resolve, reject){
            self.getEntryLayout().then(function(layout){
                // Todo: Insert extra layout templates

                layout.getFormattedLayout(type, self.layout).then(function(data){
                    resolve(data);
                });
            });
        });
    };

    EntryType.prototype.getLatex = function (){
        return this.getFormattedLayout("latex");
    };

    EntryType.prototype.getHtml = function (){
        return this.getFormattedLayout("html");
    };

    return EntryType;
};
