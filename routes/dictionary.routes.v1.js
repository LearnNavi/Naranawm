var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('Mobile App Database System V1');
});

module.exports = router;


//We need a function which handles requests and send response
function handleRequest(request, response){
    console.log(request.url);
    switch(request.url) {

        case "/dictionary/templates":
            var htmlText = "";
            //for(var lc in dictionary.templates){
            htmlText += "<h1>" + 'en' + "</h1>";
            var lcKeys = Object.keys(dictionary.templates['en']).sort();
            console.log(lcKeys);
            for(var i = 0; i < lcKeys.length; i++){
                var type = lcKeys[i];
                console.log(type);
                htmlText += type + "<br>\n";
                htmlText += dictionary.templates['en'][type];
            }
            //}
            response.end(htmlText);
            //response.end(JSON.stringify(dictionary.templates));
            break;

        case "/dictionary/languages":
            response.end(JSON.stringify(dictionary.languages));
            break;

        case "/dictionary/metadata":
            response.end(JSON.stringify(dictionary.metadata));
            break;

        case "/dictionary/entries":
            response.writeHead(200, {"Content-Type": "application/json; charset=utf-8"});
            response.end(JSON.stringify(dictionary.entries), 'utf8');
            break;

        // Fetch dictLanguages
        case "/eanaEltu/dictLanguages":
            response.end(JSON.stringify(eanaEltu.dictLanguages));
            break;

        // Fetch dictLayout
        case "/eanaEltu/dictLayout":
            response.end(JSON.stringify(eanaEltu.dictLayout));
            break;

        // Fetch dictLoc
        case "/eanaEltu/dictLoc":
            response.end(JSON.stringify(eanaEltu.dictLoc));
            break;

        // Fetch dictMeta
        case "/eanaEltu/dictMeta":
            response.end(JSON.stringify(eanaEltu.dictMeta));
            break;

        // Fetch dictOrder
        case "/eanaEltu/dictOrder":
            response.end(JSON.stringify(eanaEltu.dictOrder));
            break;

        // Fetch dictWordLoc
        case "/eanaEltu/dictWordLoc":
            response.end(JSON.stringify(eanaEltu.dictWordLoc));
            break;

        // Fetch dictWordMeta
        case "/eanaEltu/dictWordMeta":
            response.end(JSON.stringify(eanaEltu.dictWordMeta));
            break;

        // Fetch dictWordTemplate
        case "/eanaEltu/dictWordTemplate":
            response.end(JSON.stringify(eanaEltu.dictWordTemplate));
            break;

        default:
            response.end("This path doesn't exist: " + request.url);
    }

}

