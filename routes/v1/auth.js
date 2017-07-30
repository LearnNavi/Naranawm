const express = require('express');
const router = express.Router();
const config = require("../../config");
const models = require('../../models/index');
const crypto = require('crypto');


const userDatabase = config.databases.forum;
/* GET listing. */
router.post('/login', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;

    if(username === undefined || password === undefined){
        res.status(401).send("Invalid Username / Password");
        return;
    }

    models.sequelize.query(`SELECT member_name, passwd, real_name FROM ${userDatabase.database}.${userDatabase.table} WHERE member_name = :username`, {
        type: models.sequelize.QueryTypes.SELECT,
        replacements: {
            username: username
        }
    }).then(results => {
        "use strict";
        if(results !== null && results.length === 1){
            const hash = crypto.createHash("sha1");
            hash.update(results[0].member_name + password);
            const passwordHash = hash.digest("hex");
            if(passwordHash === results[0].passwd){
                // Successful Login!!!
                res.send("Login Successful!!!");
            } else {
                res.status(401).send("Invalid Username / Password");
            }
            return;
        }
        res.status(401).send("Invalid Username / Password");
    });

});

module.exports = router;
