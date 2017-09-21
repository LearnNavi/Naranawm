

const config = require("./config");

const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const jwtOptions = {};
const models = require('./models/index');
const crypto = require('crypto');
const userDatabase = config.databases.forum;

jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
jwtOptions.secretOrKey = config.jwtKey;
jwtOptions.issuer = 'naranawm.org';

passport.use(new JwtStrategy(jwtOptions, function(jwt_payload, done){
    "use strict";
    console.log(jwt_payload);
    // Just returning a basic user for now TODO: build this out
    return done(null, { id: 1 });
}));

// Todo: Move this into an extensions section so others can override
passport.use("learnNaviForum", new LocalStrategy(function(username, password, done){
    "use strict";
    if(username === undefined || password === undefined || username === "" || password === ""){
        return done(null, false, { message: "Incorrect Username / Password" });
    }

    models.sequelize.query(`SELECT ${userDatabase.database}.${userDatabase.table}.id_member, member_name, passwd, real_name, filename FROM ${userDatabase.database}.${userDatabase.table} LEFT JOIN ${userDatabase.database}.${userDatabase.attachmentTable} ON ${userDatabase.database}.${userDatabase.table}.id_member = ${userDatabase.database}.${userDatabase.attachmentTable}.id_member WHERE member_name = :username`, {
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
                return done(null, {
                    id: results[0].id_member,
                    name: results[0].real_name,
                    username: results[0].member_name,
                    avatar: "https://forum.learnnavi.org/avs/" + results[0].filename,
                    provider: "https://forum.learnnavi.org"
                });
            }
        }
        return done(null, false, { message: "Incorrect Username / Password" });
    });
}));

// Used for local testing.  TODO: Remove this once other authentication strategies are fully functional
passport.use("localTest", new LocalStrategy(function(username, password, done){
    "use strict";
    if(username === undefined || password === undefined || username === "" || password === ""){
        return done(null, false, { message: "Incorrect Username / Password" });
    }

    if(username === "test" && password === "test"){
        return done(null, {
            id: 0,
            name: "Test User",
            username: username,
            provider: "https://naranawm.org"
        });
    }

    return done(null, false, { message: "Incorrect Username / Password" });

}));

module.exports = {
    initialize: function(){
        return passport.initialize();
    },
    authenticateJwt: function () {
        return passport.authenticate("jwt", { session: false});
    },
    authenticateUser: function() {
        "use strict";
        return passport.authenticate(["localTest", "learnNaviForum"], { session: false});
    },
    createToken: function(req, res, next){
        "use strict";
        const payload = {
            id: req.user.id,
            name: req.user.name,
            username: req.user.username,
            avatar: req.user.avatar,
            provider: req.user.provider
        };
        console.log(payload);
        req.token = jwt.sign(payload, config.jwtKey, {
            expiresIn: "1d",
            issuer: "naranawm.org"
        });
        next();
    }
};
