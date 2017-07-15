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

    EntryLayout.prototype.getLatex = function(data){
        var self = this;
        return new Promise(function (resolve, reject) {

            // Wrap any METADATA fields in double braces...
            var regex = /{METADATA\.(.*)}/;
            var result = self.layout.match(regex);
            if(result){
                self.layout = self.layout.replace(result[0], "{" + result[0] + "}");
            }


            self.getEntryTemplates().then(function(templates){
                var stuff = {};

                for(var i = 0; i < templates.length; i++){
                    var template = templates[i];
                    var layoutTemplate = template.getDataValue('EntryLayoutTemplates');
                    var latexTemplate = template.getDataValue('latex');
                    latexTemplate = latexTemplate.replace("{", "{{");
                    latexTemplate = latexTemplate.replace("}", "}}");
                    var field = layoutTemplate.getDataValue('field');

                    stuff[field] = latexTemplate.replace("#", "{" + field + "}");
                }

                var layout = format(self.layout, stuff);

                if(data !== undefined){
                    // Replace {entry} with data passed in
                    layout = layout.replace("{entry}", data);
                }


                if(self.getDataValue('ParentId') !== undefined && self.getDataValue('ParentId') !== null){
                    // Get Parent Layout
                    self.getParent().then(function(parent){
                        parent.getLatex(layout).then(function(parentLatex){
                            resolve(parentLatex);
                        });
                    });
                } else {
                    resolve(layout);
                }

            });
        });
    };

    EntryLayout.prototype.getHtml = function(data){
        var self = this;
        return new Promise(function (resolve, reject) {

            // Wrap any METADATA fields in double braces...
            var regex = /{METADATA\.(.*)}/;
            var result = self.layout.match(regex);
            if(result){
                self.layout = self.layout.replace(result[0], "{" + result[0] + "}");
            }


            self.getEntryTemplates().then(function(templates){
                var stuff = {};

                for(var i = 0; i < templates.length; i++){
                    var template = templates[i];
                    var layoutTemplate = template.getDataValue('EntryLayoutTemplates');
                    var htmlTemplate = template.getDataValue('html');
                    htmlTemplate = htmlTemplate.replace("{", "{{");
                    htmlTemplate = htmlTemplate.replace("}", "}}");
                    var field = layoutTemplate.getDataValue('field');

                    stuff[field] = htmlTemplate.replace("#", "{" + field + "}");
                }

                var layout = format(self.layout, stuff);

                if(data !== undefined){
                    // Replace {entry} with data passed in
                    layout = layout.replace("{entry}", data);
                }


                if(self.getDataValue('ParentId') !== undefined && self.getDataValue('ParentId') !== null){
                    // Get Parent Layout
                    self.getParent().then(function(parent){
                        parent.getHtml(layout).then(function(parentHtml){
                            resolve(parentHtml);
                        });
                    });
                } else {
                    resolve(layout);
                }

            });
        });
    };

    return EntryLayout;
};
