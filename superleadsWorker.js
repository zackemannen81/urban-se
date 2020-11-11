/**
 * Created by zackemannen81 .
 */
var async= require('async');
var mysql =  require('mysql');
var request = require('request');

var connection =  mysql.createConnection({
    host : 'superleads.se',
user : 'dialer',
password: 'festis'
});
connection.connect();
connection.query('use sniperleads');
var i=0;
var strQuery = 'select phone from allrecords limit 1000,1000';
var counter=0;
var activeRequests=0;

function makeRequest(url,callback){
    activeRequests++;
    var options = {
        url: url,
        headers: {
            'User-Agent': 'request',
            'Keep-Alive': 'timeout=15, max=100'
        }

    };
     request(options , function (error, response, body) {

        if(error) {
            activeRequests--;
            callback(false);
        }else {
            if (!error && response.statusCode == 200) {
                //console.log(response);
                counter++;
                console.log(body +' ('+counter+') - ['+activeRequests+']'); // Show the HTML for the Google homepage.
                activeRequests--;
                //RequestWorker.end(1);
                callback();
            }
        }
    });


}
connection.query( strQuery, function(err, rows){
    if(err)	{
        throw err;
    }else{
        var urls =[];
        console.log(rows.length);
        for (i=0;i<rows.length;i++){
            urls[i]='http://localhost:8080/api/byphone/'+rows[i].phone;
            //console.log( 'http://localhost:8080/api/byphone/'+rows[i].phone  );


        }
        async.eachLimit(urls,512,makeRequest,function(err){
            if(err){console.log(err); throw err;}

            console.log('running with limits..');
        });
        connection.destroy( );
    }
});
