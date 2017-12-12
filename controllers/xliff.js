
const models = require('../models');
const debug = require('debug')('Naranawm:Xliff');
const js2xmlparser = require('js2xmlparser');

function File (name, sourceLanguage, targetLanguage) {
    "use strict";

    this.name = name;
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;

    this.file = {
        "@": {
            original: `Naranawm/${this.sourceLanguage}/${this.name}`,
            "source-language": this.sourceLanguage,
            "target-language": this.targetLanguage,
            datatype: "plaintext"
        },
        header: {
            tool: {
                "@": {
                    "tool-id": "org.naranawm",
                        "tool-name": "Naranawm",
                        "tool-version": "0.1",
                        "build-num": "1"
                }
            }
        },
        body: {
            "trans-unit": []
        }
    };
    if(this.targetLanguage === undefined){
        delete this.file["@"]["target-language"];
    }
}

File.prototype.addTransUnit = function (transUnit) {
    this.file.body['trans-unit'].push(transUnit);
};

File.prototype.getFile = function () {
    return this.file;
};

function Document (sourceLanguage, targetLanguage) {
    "use strict";
    this.sourceLanguage = sourceLanguage;
    this.targetLanguage = targetLanguage;
    this.document = {
        "@": {
            xmlns: "urn:oasis:names:tc:xliff:document:1.2",
            "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
            version: "1.2",
            "xsi:schemaLocation": "urn:oasis:names:tc:xliff:document:1.2 http://docs.oasis-open.org/xliff/v1.2/os/xliff-core-1.2-strict.xsd"
        },
        file: []
    };
}

Document.prototype.newFile = function(name) {
    "use strict";
    return new File(name, this.sourceLanguage, this.targetLanguage);
    //this.document.file.push(xliffFile);
};

Document.prototype.addFile = function (file) {
    this.document.file.push(file.getFile());
};

Document.prototype.render = function () {
    return js2xmlparser.parse("xliff", this.document, { declaration: {encoding: "UTF-8"}, format: {doubleQuotes: true}});
};

module.exports = Document;
