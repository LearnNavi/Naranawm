'use strict';
module.exports = function (sequelize, DataTypes) {
    const DictionaryBuild = sequelize.define('DictionaryBuild', {
        name: {type: DataTypes.STRING, allowNull: false},
        description: {type: DataTypes.STRING}
    });

    DictionaryBuild.associate = function (models) {
        // associations can be defined here
        DictionaryBuild.belongsTo(models.Language, {
            foreignKey: {
                allowNull: false
            },
            constraints: true,
            onDelete: 'cascade'
        });
        DictionaryBuild.hasMany(models.DictionaryBuildData, {
            onDelete: 'CASCADE'
        });
    };

    function nth(n){
        return ["st","nd","rd"][((n+90)%100-10)%10-1] || "th";
    }

    function buildMainBlock(type, block, lc){
        return new Promise(function(resolve, reject){
            block.getFormattedBlock(type, lc).then(function(formattedBlock){
                console.log(formattedBlock);
                resolve(formattedBlock);
            });
        });
    }

    DictionaryBuild.prototype.build = function (lc, type) {
        const self = this;
        return new Promise(function (resolve, reject) {
            sequelize.models.LocalizedMetadata.cache.find({where: {LanguageIsoCode: lc}}).then(function(localizedMetadata){
                self.getDictionaryBuildData({
                    include: [
                        {
                            association: "DictionaryBlock"
                        }, {
                            association: "DictionaryTemplate"
                        }
                    ],
                    order: [['position', 'ASC']]
                }).then(function (buildData) {
                    const documentParts = new Array(buildData.length);
                    const promises = [];
                    for(let i = 0; i < buildData.length; i++){
                        switch(buildData[i].type){
                            case "template":
                                documentParts[i] = buildData[i].DictionaryTemplate[type];
                                break;

                            case "mainblock":
                                promises.push(buildMainBlock(type, buildData[i].DictionaryBlock, lc).then(function(formattedBlock){
                                    documentParts[i] = formattedBlock;
                                }));
                                //document += buildData[i].DictionaryBlock
                                break;

                            case "block":

                                break;
                        }
                    }

                    Promise.all(promises).then(function(){
                        let document = documentParts.join('\n');
                        for(let i = 0; i < localizedMetadata.length; i++){
                            document = document.replace(new RegExp(`__${localizedMetadata[i].MetadatumId}__`, "g"), localizedMetadata[i].value);
                        }
                        const date = new Date();
                        const locale = "en-us";
                        const month = date.toLocaleString(locale, { month: "long" });
                        const day = date.getDate();
                        const year = date.getFullYear();
                        document = document.replace(new RegExp("___DATE___", "g"), `${month} ${day}$^{${nth(day)}}$, ${year}`);
                        resolve(document);
                    });
                });
            });
        });
    };

    return DictionaryBuild;
};
