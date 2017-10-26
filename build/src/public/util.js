/**
 * Created by sam on 1/12/15.
 */


util = {

    genID: function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });

    },

    mime: {

        key: {
            'txt': 'text/plain',
            'json': 'text/plain',
            'html': 'text/html',
            'srt': 'text/plain',
            'jpg': 'image/jpeg',
            'png': 'image/png',
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'mp4': 'video/mp4',
            'ogg': 'video/ogg'
        },
        ext2mime: function (filename) {
            var ext = filename.split('.').pop();
            var type = this.key[ext];
            return type;
        }


    },

    replaceAll:  function(string, find, replace) {

         function escapeRegExp(string) {
            return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
        }

    return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
    },

    safeApply: function (scope, fn) {

        fn = fn || function () {};

        var phase = scope.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            scope.$apply(fn);

        }

    },

    strip: function (input) {

        return JSON.parse(JSON.stringify(input));
    },

    toArray: function (string, comma) {

        var target = [];

        if(string !== ""){

            var literal =  	string.split('[')[1].split(']')[0];

            var array = literal.split(',');

            for (var i =0;  i<array.length;  i++) {


                target.push(array[i].split(comma)[1]);
            }
        }

        return target;

    },

    debug:{

        init: Date.now(),

        messages: [],

        warn: function (msg, toConsole) {
            this.add(msg, 'warn', toConsole);
        },

        notify: function (msg, toConsole) {
            this.add(msg, 'notify', toConsole);
        },

        info: function (msg, toConsole) {
            this.add(msg, 'info', toConsole);
        },

        log: function (msg, toConsole) {
            this.add(msg, 'log', toConsole);
        },


        add: function (msg, type, toConsole) {

            toConsole = toConsole || true;

            var stamp = Date.now() - this.init;

            if(toConsole){
                console[type](msg);
            }

            var object = {
                text: msg,
                time: stamp,
                type: type
            };

            this.messages.push(object);

        },

        report: function () {
            return JSON.stringify(this.messages);
        }


    },
    dataURLtoBlob: function(dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = decodeURIComponent(parts[1]);

        return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
},

    getReadableFileSizeString: function(fileSizeInBytes) {

    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
},

    storage: {

        local: {

            get: function(key){

                return JSON.parse(localStorage[key]);
            },
            set: function(key, object){

                localStorage[key]  =JSON.stringify(object);
            }
        },

        session: {

            get: function(key){
                return JSON.parse(sessionStorage[key]);
            },
            set: function(key, object){

                sessionStorage[key]  =JSON.stringify(object);
            }

        }
    },

    mergeObjects: function(source, target){

       var toReturn = JSON.parse(JSON.stringify(target));

        Object.keys(source).forEach((function (key) {
            toReturn[key] = source[key];
        }));

        return toReturn;
    }

};




