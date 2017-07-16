'use strict';
var format = require('string-format');
var Promise = require('bluebird');

module.exports = function (sequelize, DataTypes) {
    var EntryLayout = sequelize.define('EntryLayout', {
        id: { type: DataTypes.STRING, primaryKey: true },
        layout: { type: DataTypes.STRING, allowNull: false }
    });

    EntryLayout.associate = function (models) {
        // associations can be defined here
        EntryLayout.belongsTo(models.EntryLayout, {
            as: "Parent",
            foreignKey: {
                allowNull: true
            }
        });

        EntryLayout.belongsToMany(models.EntryTemplate, {
            through: {
                model: models.EntryLayoutTemplates,
                unique: false
            },
            primaryKey: true
        });
    };

    EntryLayout.prototype.getFormattedLayout = function(type, data) {
        var self = this;
        return new Promise(function (resolve, reject) {

            self.getEntryTemplates().then(function(templates){
                var stuff = {};

                for(var i = 0; i < templates.length; i++){
                    var template = templates[i];
                    var layoutTemplate = template.getDataValue('EntryLayoutTemplates');
                    var typeTemplate = template.getDataValue(type);
                    typeTemplate = typeTemplate.replace("{", "{{");
                    typeTemplate = typeTemplate.replace("}", "}}");
                    var field = layoutTemplate.getDataValue('field');

                    stuff[field] = typeTemplate.replace("#", "{" + field + "}");
                    if(field === "entry"){
                        self.layout = self.layout.replace("{entry}", stuff[field]);
                    }
                }
                if(data !== undefined && data !== ""){
                    stuff['entry'] = data;
                } else {
                    self.layout = self.layout.replace("{entry}", "{{entry}}");
                }


                var layout = format(self.layout, stuff);
                //console.log(self.layout, layout, data, stuff['entry']);

                if(data !== undefined){
                    // Replace {entry} with data passed in
                    //layout = layout.replace("{entry}", data);
                }


                if(self.getDataValue('ParentId') !== undefined && self.getDataValue('ParentId') !== null){
                    // Get Parent Layout
                    self.getParent().then(function(parent){
                        parent.getFormattedLayout(type, layout).then(function(parentFormattedLayout){
                            resolve(parentFormattedLayout);
                        });
                    });
                } else {
                    resolve(layout);
                }

            });
        });
    };

    EntryLayout.prototype.getLatex = function(data){
        return this.getFormattedLayout('latex', data);
    };

    EntryLayout.prototype.getHtml = function(data){
        return this.getFormattedLayout('html', data);
    };

    return EntryLayout;
};
