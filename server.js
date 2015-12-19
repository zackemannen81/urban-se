// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var encoding = require('encoding');
var util = require('util');
var mimelib = require("mimelib");
var vcardparser = require('vcardparser');
var request =require('request');
var http = require('http');
var vcardUri;
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router




router.use(function(req, res, next) {
    // do logging
    console.log('Recieved command...');
    next(); // make sure we go to the next routes and don't stop here
});
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    //res.json({ message: encoding.convert('Yeah welcome to pentagon API!', "Latin_1" ).toString('Latin_1')});   
    res.json({ message: 'Yeah welcome to pentagon API!' });   
});

// more routes for our API will happen here
router.route('/byphone')

    .post(function(req, res) {
        
        
    })

    .get(function(req, res) {
       res.json({ message: 'Internet is big!' }); 
    });

router.route('/byphone/:phonenr')

  
    .get(function(req, res) {
    	var iPhonenumber=req.params.phonenr ;


        var reqUrl='http://api.hitta.se/autocomplete/v2/'+iPhonenumber+'?callback=hittaCallback2015&web=5';



request(reqUrl, function (error, response, body) {
    if (error) {
    			//messageToBlob+=err;
    			res.send(error);
    			return console.log(error);
    		}
    if (!error && response.statusCode == 200 &&body.length>12) {
    	if (JSON.parse(body).web[0].type=='cmp')  	vcardUri='http://www.hitta.se/vcard_företag/'+JSON.parse(body).web[0].id;
if (JSON.parse(body).web[0].type=='prv')  	vcardUri='http://www.hitta.se/vcard_person/'+JSON.parse(body).web[0].id;
console.log(vcardUri); // Show the HTML for the homepage.
    	
    	var nestedReq= new request(vcardUri, function (error, response, body) {
    if (!error && response.statusCode == 200) {
    	messageToBlob=body;
    	//console.log(body);
    	tmpcard= new vcardparser.parseString('\n'+body, function(err, jData) {
    		if (err) {
    			//messageToBlob+=err;
    			//res.send(err);
    			return console.log(err);
    		}
	console.log(mimelib.decodeMimeWord(body));
	jData.ssnr='000000-xxxx';
	res.send(body.replace('\r','|'));
	console.log(jData.tel[0].value);
	//decodeQuotedPrintable(jData, 1,'iso-8859-1')
	//res.send(messageToBlob);
	//res.send(body);

});
        //console.log(body); // Show the HTML for the homepage.
        //res.json(jData);
    }else{res.send('ingen data');}
});
        
    }else{res.send('ingen person');}
});
        //res.json({ message: 'search using phonenr:'+iPhonenumber}); 
  /*

  var externData = Nightmare({ show: false })
  .goto(reqUrl)
.wait()
    .evaluate(function(){
        // access the dom element
        return document.body.innerText;
    }, function(rData){
        // get the return value from the first param
        //console.log(rData);
    })
    .run(function(err, result) {
    if (err) return console.log(err);
    var resultSet=JSON.parse(result.replace('hittaCallback(','').replace(')',''));
    res.send({'the person' :resultSet,'VCARDLINK':'http://www.hitta.se/vcard_person/'+resultSet.web[0].id });
    console.log(resultSet.web[0].id);

    /*  var vcard=  new Nightmare({ show: false })
    .goto('http://www.hitta.se/vcard_person/'+resultSet.web[0].id)
 .run();
    //console.log(result);
*/
   /*   });  
       //res.json({message: 'found'}); 
       //res.end(); 
       //hitta_autocomplete(iPhonenumber);
    */});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Ruuning on port ' + port);