// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var cluster = require('cluster');

if(cluster.isMaster) {
    var numWorkers = require('os').cpus().length;

    console.log('Master cluster setting up ' + numWorkers + ' workers...');

    for(var i = 0; i < numWorkers; i++) {
        cluster.fork();
    }

    cluster.on('online', function(worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
        worker.starttime=new Date().getTime();
    });

    cluster.on('exit', function(worker, code, signal) {
        var now=new Date().getTime();
        var sumworktime = now - worker.starttime;
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Worker '+ worker.process.pid + ' only worked for .. '+sumworktime + 'millisec and then went to Unionen. ;-§');
        console.log('Must be ignorant or really persistant.. so. Starting a new worker');

        cluster.fork();
    });
} else {

    var express = require('express');        // call express
    var app = express();                 // define our app using express
    var bodyParser = require('body-parser');
    var encoding = require('encoding');
    var util = require('util');
    var mimelib = require("mimelib");
    var vcardparser = require('vcardparser');
    var request = require('request');
    var http = require('http');
    var mongoose = require('mongoose');
    var vCardSchema = require('mongoose-schema-vcard');
    var Table = require('cli-table');
	var randomstring = require("randomstring");
	var Schema = mongoose.Schema;
			var hittaPersonSchema=new Schema({
	id: {
		type: 'String'
	},
	displayName: {
		type: 'String'
	},
	metadata: {
		score: {
			type: 'Number'
		}
	},
	attribute: {
		type: [
			'Mixed'
		]
	},
	address: {
		type: [
			'Mixed'
		]
	},
	phone: {
		type: [
			'Mixed'
		]
	}
});
    var vcardUri;
    var person;
	var hittaPerson;
	
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

    var port = process.env.PORT || 8080;        // set our port
    var router = express.Router();              // get an instance of the express Router

    //mongoose.connect('mongodb://localhost/persons');
	mongoose.connect('mongodb://urban:urban2018@cluster0-shard-00-00-vc1xu.mongodb.net:27017,cluster0-shard-00-01-vc1xu.mongodb.net:27017,cluster0-shard-00-02-vc1xu.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin');
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function (callback) {
        console.log('connected to database.');
        person = mongoose.model('person', vCardSchema);

hittaPerson=mongoose.model('hittaPerson',hittaPersonSchema);

        // yay!
    });
    var findOperatorlist = function (phonenr, mycallback) {
        // res.json({ message: 'Internet is big!' });
        var thelistofnumbers = '';
        var reslist = phonenr.split(',');
//console.log(reslist.length + 'o first is'+reslist[0].substring(2));

        for (k = 0; k < reslist.length; k++) {
            var inNumber = reslist[k].substring(2);
            var num = '';
            var ndc = '';
//console.log([11, 13, 16, 18, 19, 21, 23, 26, 31, 33, 35, 36, 40, 42, 44, 46, 54, 60, 63, 90].indexOf(parseInt(inNumber.substring(0,2))));
            if ([11, 13, 16, 18, 19, 21, 23, 26, 31, 33, 35, 36, 40, 42, 44, 46, 54, 60, 63, 90].indexOf(parseInt(inNumber.substring(0, 2))) >= 0) {
                ndc = inNumber.substring(0, 2);
                num = inNumber.substring(2);
            }
            if (inNumber.substring(0, 1) == '8') {
                ndc = '8';
                num = inNumber.substring(1);
            }
            if ([11, 13, 16, 18, 19, 21, 23, 26, 31, 33, 35, 36, 40, 42, 44, 46, 54, 60, 63, 90].indexOf(parseInt(inNumber.substring(0, 2))) == -1
                && inNumber.substring(0, 1) != '8') {
                ndc = inNumber.substring(0, 3);
                num = inNumber.substring(3);
            }
            thelistofnumbers += ndc + '-' + num + ',';
        }
        var reqUrl = 'http://api.pts.se/PTSNumberService/Pts_Number_Service.svc/json/SearchByNumberList?numbers=' + thelistofnumbers.substring(0, thelistofnumbers.length - 1);
        //console.log(thelistofnumbers);
        request(reqUrl, function (error, response, body) {
            if (error) {
                //messageToBlob+=err;
                //res.send(error);
                return console.log(error);
            }
            if (!error && response.statusCode == 200 && body.length > 12) {
                //console.log(JSON.parse(body).d.Name);
                console.log('found ' + reslist.length + ' phonenumbers and carriers');
                //res.send(JSON.parse(body).d.Name);
                var operator = JSON.parse(body);
                mycallback(null, operator);
                return JSON.parse(body);
            }
        });
    }
    var findOperator = function (phonenr, mycallback) {
        // res.json({ message: 'Internet is big!' });

        var inNumber = phonenr.substring(1);
        var num = '';
        var ndc = '';
        console.log([11, 13, 16, 18, 19, 21, 23, 26, 31, 33, 35, 36, 40, 42, 44, 46, 54, 60, 63, 90].indexOf(parseInt(inNumber.substring(0, 2))));
        if ([11, 13, 16, 18, 19, 21, 23, 26, 31, 33, 35, 36, 40, 42, 44, 46, 54, 60, 63, 90].indexOf(parseInt(inNumber.substring(0, 2))) >= 0) {
            ndc = inNumber.substring(0, 2);
            num = inNumber.substring(2);
        }
        if (inNumber.substring(0, 1) == '8') {
            ndc = '8';
            num = inNumber.substring(1);
        }
        if ([11, 13, 16, 18, 19, 21, 23, 26, 31, 33, 35, 36, 40, 42, 44, 46, 54, 60, 63, 90].indexOf(parseInt(inNumber.substring(0, 2))) == -1
            && inNumber.substring(0, 1) != '8') {
            ndc = inNumber.substring(0, 3);
            num = inNumber.substring(3);
        }
        var reqUrl = 'http://api.pts.se/PTSNumberService/Pts_Number_Service.svc/json/SearchByNumber?number=' + ndc + '-' + num;
        request(reqUrl, function (error, response, body) {
            if (error) {
                //messageToBlob+=err;
                //res.send(error);
                return console.log(error);
            }
            if (!error && response.statusCode == 200 && body.length > 12) {
                console.log(JSON.parse(body).d.Name);
                //res.send(JSON.parse(body).d.Name);
                var operator = JSON.parse(body).d.Name
                mycallback(null, operator);
                return JSON.parse(body).d.Name;
            }
        });
    }
//router.use(require('apikey')(auth, 'superapi'));

    /*function auth (key, fn) {
     if ('test' === key)
     fn(null, { id: '1', name: 'John Dorian'})
     else
     fn(null, null)
     };*/


    router.use(function (req, res, next) {
        // do logging
        console.log('New api command detected! ');
        next(); // make sure we go to the next routes and don't stop here
    });
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
    router.get('/', function (req, res) {
        //res.json({ message: encoding.convert('Yeah welcome to pentagon API!', "Latin_1" ).toString('Latin_1')});
        res.json({message: 'Yeah welcome to pentagon API! not authorized dude!'});
    });

    router.get('/hittaAPI/person/:search', function (req, res) {
	
	var searchVar = req.params.search;
	var key='OZqD5gHWZ3mKhg5TiU5thx7K7YJCzRG0dtTNxhWT';
	var caller_id='zackemannen81';
	var now=new Date();
	//var time=Math.round((now/1000) -(now.getTimezoneOffset() * 60)).toString();
	var time= Math.round((Date.now() /1000)).toString();
	console.log(time);
	var random=randomstring.generate(16);
	
	var string_to_hash = caller_id + time + key + random;
	var crypto = require('crypto'), shasum = crypto.createHash('sha1');
	shasum.update(string_to_hash);
	var hashed_string = shasum.digest('hex');
	var options = {
            method: 'GET', encoding: 'binary',
            url: 'https://api.hitta.se/publicsearch/v1/combined?what='+searchVar+'&page.number=1&page.size=100',
            headers: {
                'X-Hitta-CallerId': caller_id,
                'X-Hitta-Time': time,
                'X-Hitta-Random': random,
				'X-Hitta-Hash' : hashed_string
            },
            formData: {}
	};
	
	            hittaPerson.count({'tel.value': searchVar}, function (err, recordCount) {
                if (err) {
                    return console.log(err);
                    res.json({message: error});
                }
                if (recordCount < 1) {
					
	      request(options, function (error, response, body) {
            if (error) throw new Error(error);
var hittaData=JSON.parse(body).result.persons;

            //console.log(body);
            //res.json(body);
			console.log(hittaData.person[0]);
		res.json(hittaData);
			for (var i = 0; i < Object.keys(hittaData.person).length; i++) {
				
				var hittaPersonPointer=new hittaPerson(hittaData.person[i]);
				
				var searchId=hittaData.person[i].id;
				hittaPersonPointer.save(function (err,updatedHittaPerson) {
                                                    if (err) return console.log(err);
                                                    hittaPerson.find({'id.value': updatedHittaPerson.id}, function (err, tmpData) {
                                                        if (err) return console.log(err);                                                    
                                                        console.log('Inserted new person from hitta.se into database with id' +updatedHittaPerson.id ); // { name: 'mongodb.org', _id: '50341373e894ad16347efe12' }
                                                    });
													});
                                                    //console.log(hittaData.person[i].displayName);
													//resbuilder+=hittaData.person[i];
                                               // res.json(hittaData.person[i]);

                                                }
												//res.json(doc);
												//res.json(resbuilder);
												//console.log(JSON.parse(body).result.persons.person[0]);
        });
    });

    router.get('/getInfoFromSsnr/:ssnr', function (req, res) {
        var personnummerSeek = req.params.ssnr;
        var options = {
            method: 'POST', encoding: 'binary',
            url: 'https://www.skapamer.se/ajax/ajax_get_klarna_address.php',
            headers: {
                'postman-token': 'e1fc1d18-4e7c-a949-c8f5-85d8ca19d190',
                'cache-control': 'no-cache',
                'content-type': 'multipart/form-data; boundary=---011000010111000001101001;charset=iso-8859-1'
            },
            formData: {personnummer: personnummerSeek}
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
            res.json(body);
        });
    });
    router.route('/formatnumber/:phonenr')


        .get(function (req, res) {
            // res.json({ message: 'Internet is big!' });
            var inNumber = req.params.phonenr.substring(1);
            var num = '';
            var ndc = '';
            console.log([11, 13, 16, 18, 19, 21, 23, 26, 31, 33, 35, 36, 40, 42, 44, 46, 54, 60, 63, 90].indexOf(parseInt(inNumber.substring(0, 2))));
            if ([11, 13, 16, 18, 19, 21, 23, 26, 31, 33, 35, 36, 40, 42, 44, 46, 54, 60, 63, 90].indexOf(parseInt(inNumber.substring(0, 2))) >= 0) {
                ndc = inNumber.substring(0, 2);
                num = inNumber.substring(2);
            }
            if (inNumber.substring(0, 1) == '8') {
                ndc = '8';
                num = inNumber.substring(1);
            }
            if ([11, 13, 16, 18, 19, 21, 23, 26, 31, 33, 35, 36, 40, 42, 44, 46, 54, 60, 63, 90].indexOf(parseInt(inNumber.substring(0, 2))) == -1
                && inNumber.substring(0, 1) != '8') {
                ndc = inNumber.substring(0, 3);
                num = inNumber.substring(3);
            }
            var reqUrl = 'http://api.pts.se/PTSNumberService/Pts_Number_Service.svc/json/SearchByNumber?number=' + ndc + '-' + num;
            request(reqUrl, function (error, response, body) {
                if (error) {
                    //messageToBlob+=err;
                    res.send(error);
                    return console.log(error);
                }
                if (!error && response.statusCode == 200 && body.length > 12) {
                    console.log(JSON.parse(body).d.Name);
                    res.send(JSON.parse(body).d.Name);
                }
            });


        });
// more routes for our API will happen here
    router.route('/byphone')

        .post(function (req, res) {


        })

        .get(function (req, res) {
            res.json({message: 'Internet is big!'});
        });
    router.route('/validate')

        .post(function (req, res) {


        })

        .get(function (req, res) {
            res.json({message: 'Internet is big!'});
        });

    router.route('/find/:searchstring')
        .get(function (req, res) {
            var searchstring = '+46' + req.params.searchstring.substring(1);

            person.find({'tel.value': searchstring}, function (err, doc) {
                if (err) {
                    return console.log(err);
                    res.json({message: searchstring});
                }
                res.json(doc);
                console.log(doc); // { name: 'mongodb.org', _id: '50341373e894ad16347efe12' }
            });
        });
    router.route('/find/:searchstring/remove')
        .get(function (req, res) {
            var searchstring = '+46' + req.params.searchstring.substring(1);

            person.remove({'tel.value': searchstring}, function (err) {
                if (err) {
                    return console.log(err);
                    res.json({message: searchstring});
                }
                res.json({message: 'Removed all persons with CAST number'});
                console.log('warning someone called remove command..'); // { name: 'mongodb.org', _id: '50341373e894ad16347efe12' }
            });
        });


    router.route('/validate/:phonenr')


        .get(function (req, res) {
            var iPhonenumber = req.params.phonenr;


            var reqUrl = 'http://api.hitta.se/autocomplete/v2/' + iPhonenumber + '?callback=hittaCallback2015&web=5';


            request(reqUrl, function (error, response, body) {
                if (error) {
                    //messageToBlob+=err;
                    res.send(error);
                    return console.log(error);
                }
                if (!error && response.statusCode == 200 && body.length > 12) {
                    if (JSON.parse(body).web[0].type == 'cmp')    vcardUri = 'http://www.hitta.se/vcard_företag/' + JSON.parse(body).web[0].id;
                    if (JSON.parse(body).web[0].type == 'prv')    vcardUri = 'http://www.hitta.se/vcard_person/' + JSON.parse(body).web[0].id;
                    console.log(vcardUri); // Show the HTML for the homepage.
                    res.send(vcardUri);
                    //console.log(body); // Show the HTML for the homepage.
                }

                else {
                    console.log('nobody found!');
                    res.send('ingen person');
                }
            });
        });

    router.route('/byphone/:phonenr')


        .get(function (req, res) {
            var iPhonenumber = req.params.phonenr;


            var reqUrl = 'http://api.hitta.se/autocomplete/v2/' + iPhonenumber + '?callback=hittaCallback2015&web=5';
            var searchstring = '+46' + req.params.phonenr.substring(1);

            person.count({'tel.value': searchstring}, function (err, recordCount) {
                if (err) {
                    return console.log(err);
                    res.json({message: error});
                }
                if (recordCount < 1) {
                    console.log('no person with that searchstring is found.. crawling the web for info..');


                    request(reqUrl, function (error, response, body) {
                        if (error) {
                            //messageToBlob+=err;
                            res.send(error);
                            return console.log(error);
                        }
                        if (!error && response.statusCode == 200 && body.length > 12) {
                            var leadtype = JSON.parse(body).web[0].type;
                            if (JSON.parse(body).web[0].type == 'cmp')    vcardUri = 'http://www.hitta.se/vcard_företag/' + JSON.parse(body).web[0].id;
                            if (JSON.parse(body).web[0].type == 'prv')    vcardUri = 'http://www.hitta.se/vcard_person/' + JSON.parse(body).web[0].id;
//console.log(vcardUri); // Show the HTML for the homepage.
                            console.log('Found a contact of type:' + JSON.parse(body).web[0].type + ' parsing data..');
                            var nestedReq = new request(vcardUri, function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                    messageToBlob = body;
                                    //console.log(body);
                                    tmpcard = new vcardparser.parseString(body, function (err, jData) {
                                        if (err) {
                                            //messageToBlob+=err;
                                            //res.send(err);
                                            return console.log(err);
                                        }
                                        if (jData.tel) {

                                            var numbers = '';
                                            for (var i = 0; i < Object.keys(jData.tel).length; i++) {
                                                numbers += jData.tel[i].value.replace('+', '') + ',';

                                            }
                                            console.log('Got ' + Object.keys(jData.tel).length + ' phonenumbers, fetching operator status..of ' + numbers);
                                            jData.id = jData.tel[0].value.replace('+', '');
                                            //console.log(jData.tel[0].value.replace('+','').substring(2));
                                            //findOperator('0'+jData.tel[0].value.replace('+','').substring(2),function(err,operator){
                                            findOperatorlist(numbers.substring(0, numbers.length - 1), function (err, operator) {
                                                //jData.tel[0].opflg=""+findOperator('0'+jData.tel[0].value.replace('+','').substring(2))+"";
//console.log(operator);
                                                for (var i = 0; i < Object.keys(jData.tel).length; i++) {
                                                    jData.tel[i].opflg = "" + operator.d[i].Name + "";
                                                    jData.tel[i].prio = i;

                                                }
                                                //jData.tel[0].opflg=""+operator+"";
                                                //console.log('as json :' +jData);
                                                console.log('as string:' +JSON.stringify(jData));
                                                var inPerson = new person(jData);
//console.log(person.find('tel.value : '+jData.tel[0].value));
//inPerson._id=jData.id;
//console.log(inPerson);
                                                inPerson.save(function (err) {
                                                    if (err) return console.log(err);
                                                    person.find({'tel.value': jData.tel[0].value}, function (err, doc) {
                                                        if (err) return console.log(err);
                                                        res.json(doc);
                                                        console.log('Inserted new person into database..' + jData.tel[0].value); // { name: 'mongodb.org', _id: '50341373e894ad16347efe12' }
                                                    });

                                                });
                                            });
                                        }
                                        else {

                                            var text = '[{"type":"home","value":"+' + searchstring.substring(1) + '" }]';

                                            jData.tel = JSON.parse(text);
                                            console.log(jData);
//obj.tel[0].type + " " + obj.tel[0].value;
                                            //jData.tel[0].value=searchstring;
                                            jData.id = jData.tel[0].value;
                                            jData.tel[0].prio = 0;
                                            //console.log(jData.tel[0].value.replace('+','').substring(2));
                                            findOperator('0' + jData.tel[0].value.replace('+', '').substring(2), function (err, operator) {
                                                //jData.tel[0].opflg=""+findOperator('0'+jData.tel[0].value.replace('+','').substring(2))+"";
//console.log(operator);

                                                jData.tel[0].opflg = "" + operator + "";
                                                console.log(jData);
                                                var inPerson = new person(jData);
//console.log(person.find('tel.value : '+jData.tel[0].value));
//inPerson._id=jData.id;
//console.log(inPerson);
                                                inPerson.save(function (err) {
                                                    if (err) return console.log(err);
                                                    person.find({'tel.value': jData.tel[0].value}, function (err, doc) {
                                                        if (err) return console.log(err);
                                                        res.json(doc);
                                                        console.log('Inserted new person without phonenumber in VCARD into database..'); // { name: 'mongodb.org', _id: '50341373e894ad16347efe12' }
                                                    });

                                                });
                                            });
                                        }
                                        // saved!

                                        //jData.ssnr='000000-xxxx';
//fix quoted prinable encoding

                                        /* for(var attributename in jData){
                                         console.log(attributename+": "+jData[attributename] + " decoded:"+mimelib.decodeQuotedPrintable(jData[attributename],1,'iso-8859-1'));
                                         }*/


                                        //res.send(body.replace('\r','|'));
                                        //console.log(jData.tel[0].value);
                                        //decodeQuotedPrintable(jData, 1,'iso-8859-1')
                                        //res.send(messageToBlob);
                                        //res.send(body);

                                    });
                                    //console.log(body); // Show the HTML for the homepage.
                                    //res.json(jData);
                                } else {
                                    res.send('ingen data');
                                    console.log('No data on vcard');
                                    //exit(0);
                                }
                            });

                        } else {
                            res.send('ingen person');
                            console.log('Nobody found!');
                            //exit(0);
                        }
                    });

                } else {
                    person.find({'tel.value': searchstring}, function (err, doc) {
                        if (err) {
                            return console.log(err);
                            res.json({message: searchstring});
                        }
                        res.json(doc);
                        console.log('Person was already in the database.. using cached data'); // { name: 'mongodb.org', _id: '50341373e894ad16347efe12' }
                       // exit(0);
                    });
                }
            });
        });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
//curl 'https://www.skapamer.se/ajax/ajax_get_klarna_address.php' -H 'Cookie: nav=b%3A0%3B; sa=1128518; zenid=lk6ns6hkque5b6hl8p0nh2h560; cookie_test=please_accept_for_session' -H 'X-NewRelic-ID: XAECV1RSGwYIXFBWAQk=' -H 'Origin: https://www.skapamer.se' -H 'Accept-Encoding: gzip, deflate' -H 'Accept-Language: sv-SE,sv;q=0.8,en-US;q=0.6,en;q=0.4' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36' -H 'Content-Type: application/x-www-form-urlencoded; charset=UTF-8' -H 'Accept: */*' -H 'Referer: https://www.skapamer.se/index.php?main_page=checkout' -H 'X-Requested-With: XMLHttpRequest' -H 'Connection: keep-alive' --data 'personnummer=810117-1935' --compressed
    router.get('/listEndpoints', function (req, res) {
        //res.json({ message: encoding.convert('Yeah welcome to pentagon API!', "Latin_1" ).toString('Latin_1')});
        var routes = router.stack;
        var table = new Table({head: ["", "Name", "Path"]});
        var jsonRoutes = '[{ "endpoints ": {';
        for (var key in routes) {
            if (routes.hasOwnProperty(key)) {
                var val = routes[key];
                if (val.route) {
                    val = val.route;
                    var _o = {};
                    _o[val.stack[0].method] = [val.path, val.path];
                    jsonRoutes += '{[ "type" : "' + val.stack[0].method + '","path" : "' + val.path + '"]}'
                    table.push(_o);
                }

            }
        }
        jsonRoutes += '}}]';
        console.log(table.toString());
        res.send(jsonRoutes);
    });
    app.use('/api', router);

// START THE SERVER
// =============================================================================
    app.maxConnections = 10000;
    app.listen(port, function() {
        console.log('Ruuning on port ' + port);
        console.log('Process ' + process.pid + ' is listening to all incoming requests');
    });
}