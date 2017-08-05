const express = require('express');
const router = express.Router();
const models = require('../../models/index');

/* GET listing. */

// Get list of defined models
router.get('/', function (req, res, next) {
    let definedModels = Object.keys(models).filter(function(model){
        "use strict";
        return model.toLowerCase() !== "sequelize";
    });

    res.send(definedModels);
});

router.get('/:model', function(req, res, next) {
    const model = models[req.params.model];
    if(model === undefined){
        res.status(400).send(`Model [${req.params.model}] does not exist`);
        return;
    }

    const queryOptions = {};

    if(req.query.limit !== undefined){
        queryOptions.limit = parseInt(req.query.limit);
        delete req.query.limit;
    }

    if(req.query.offset !== undefined){
        queryOptions.offset = parseInt(req.query.offset);
        delete req.query.offset;
    }

    queryOptions.where = req.query;
    model.findAll(queryOptions).then(function (data) {
        "use strict";
        res.send(data);
    }).catch(function (error) {
        res.status(400).send(`[${error.name}] ${error.original.code}`);
    });

});

router.get('/:model/:id', function(req, res, next) {
    const model = models[req.params.model];
    if(model === undefined){
        res.status(400).send(`Model [${req.params.model}] does not exist`);
        return;
    }

    model.findById(req.params.id).then(function (data) {
        "use strict";
        if(data === null){
            res.status(404).send(`Entity for ID [${req.params.id}] does not exist for Model [${req.params.model}]`);
        } else {
            res.send(data);
        }
    });

});

module.exports = router;
