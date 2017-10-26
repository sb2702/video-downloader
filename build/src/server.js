/**
 * Created by sam on 16-10-20.
 */

var express = require('express');
var path =require('path');
var app = express();
var http = require('http');

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var request  = require('request');


app.use(express.static(__dirname + '/public'));


app.post('/getVidInfo', jsonParser, function (req, res) {

    var id = req.body.vid_id;



    var options = {
        host: 'www.youtube.com',
        path: '/get_video_info?video_id=' + id
    };


    var callback = function (response) {
        var str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            process(str);
        });
    };

    var process = function (data) {




        var info = {};
        parse_str(data, info);


        if(info['status']== 'fail'){
            return res.status(400).send("Bad Video ID");
        }





        var streams = info['url_encoded_fmt_stream_map'].split(",");

        var results = [];
        for (var i = 0; i < streams.length; i++) {
            var real_stream = {};
            parse_str(streams[i], real_stream);
            real_stream['url'] += '&signature=' + real_stream['sig'];
            results.push(real_stream);
        };





        var toSend = {
            streams: results,
            author:  info.author,
            created: info.timestamp,
            thumbnail: info.thumbnail_url,
            image: info.iurlhq,
            title: info.title
        };


        res.status(200).send(toSend);


    };

    var req2 = http.get(options, callback).end();

});


app.post('/getVidFile', jsonParser, required(['url']), function (req, res) {

    var stream = request.get(req.body.url);

    stream.on('response', function(response){
        res.setHeader('Content-Type', response.headers['content-type']);
        res.setHeader('Content-Length', response.headers['content-length']);
     //   res.setHeader('Accept-Ranges', response.headers['accept-ranges']);

    });

    stream.pipe(res);

});



app.post('/getVidSize', jsonParser, required(['url']),  function (req, res) {

    var url = req.body.url;

    var stream = request.head(url, {}, function (error, response) {

        if(error){
            return   res.status(500).send("An error occurred trying to get info");
        } else{

            res.setHeader("Content-Type", "text/plain");
            var x = response.headers['content-length'];

            res.status(200).send(x);

        }

    });

});

function parse_str(str, array) {
    //       discuss at: http://phpjs.org/functions/parse_str/
    //      original by: Cagri Ekin


    var strArr = String(str)
            .replace(/^&/, '')
            .replace(/&$/, '')
            .split('&'),
        sal = strArr.length,
        i, j, ct, p, lastObj, obj, lastIter, undef, chr, tmp, key, value,
        postLeftBracketPos, keys, keysLen,
        fixStr = function(str) {
            return decodeURIComponent(str.replace(/\+/g, '%20'));
        };

    if (!array) {
        array = this.window;
    }

    for (i = 0; i < sal; i++) {
        tmp = strArr[i].split('=');
        key = fixStr(tmp[0]);
        value = (tmp.length < 2) ? '' : fixStr(tmp[1]);

        while (key.charAt(0) === ' ') {
            key = key.slice(1);
        }
        if (key.indexOf('\x00') > -1) {
            key = key.slice(0, key.indexOf('\x00'));
        }
        if (key && key.charAt(0) !== '[') {
            keys = [];
            postLeftBracketPos = 0;
            for (j = 0; j < key.length; j++) {
                if (key.charAt(j) === '[' && !postLeftBracketPos) {
                    postLeftBracketPos = j + 1;
                } else if (key.charAt(j) === ']') {
                    if (postLeftBracketPos) {
                        if (!keys.length) {
                            keys.push(key.slice(0, postLeftBracketPos - 1));
                        }
                        keys.push(key.substr(postLeftBracketPos, j - postLeftBracketPos));
                        postLeftBracketPos = 0;
                        if (key.charAt(j + 1) !== '[') {
                            break;
                        }
                    }
                }
            }
            if (!keys.length) {
                keys = [key];
            }
            for (j = 0; j < keys[0].length; j++) {
                chr = keys[0].charAt(j);
                if (chr === ' ' || chr === '.' || chr === '[') {
                    keys[0] = keys[0].substr(0, j) + '_' + keys[0].substr(j + 1);
                }
                if (chr === '[') {
                    break;
                }
            }

            obj = array;
            for (j = 0, keysLen = keys.length; j < keysLen; j++) {
                key = keys[j].replace(/^['"]/, '')
                    .replace(/['"]$/, '');
                lastIter = j !== keys.length - 1;
                lastObj = obj;
                if ((key !== '' && key !== ' ') || j === 0) {
                    if (obj[key] === undef) {
                        obj[key] = {};
                    }
                    obj = obj[key];
                } else { // To insert new dimension
                    ct = -1;
                    for (p in obj) {
                        if (obj.hasOwnProperty(p)) {
                            if (+p > ct && p.match(/^\d+$/g)) {
                                ct = +p;
                            }
                        }
                    }
                    key = ct + 1;
                }
            }
            lastObj[key] = value;
        }
    }
};




function  required (fields) {

    return function (req, res, next) {

        for(i in fields){

            var field = fields[i];

            var keys = field.split(".");

            var ob = req.body;

            for(j in keys){

                var key = keys[j];

                if(typeof  ob[key] == 'undefined') {
                    return res.status(400).send('Bad Request - missing fields');

                }
                else{
                    ob = ob[key];
                }
            }
        };
        next();

    };
};




app.listen(3000);