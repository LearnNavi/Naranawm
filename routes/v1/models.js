const express = require('express');
const router = express.Router();
const models = require('../../models/index');

/* GET listing. */
router.get('/:model', function(req, res, next) {
    const model = models[req.params.model];
    if(model === undefined){
        res.status(400).send(`Model [${req.params.model}] does not exist`);
        return;
    }

    model.findAll().then(function (data) {
        "use strict";
        res.send(data);
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