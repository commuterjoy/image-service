
var im = require('imagemagick'),
    http = require('http'),
    util = require('util');

/* proxy any old imagemagick command */
exports.proxy = function(t, callback) {
    var proc = im.convert(t.args, t.opt.timeout, callback);
    if ('string' === typeof t.opt.srcData) {
        proc.stdin.setEncoding('binary');
        proc.stdin.write(t.opt.srcData, 'binary');
        proc.stdin.end();
    } else {
        proc.stdin.end(t.opt.srcData);
    }
    return proc;
}

var crop = function(data, geom, callbacks) {
    exports.proxy({
        args: ['-', '-crop', geom, 'jpg:-'],
        opt: {
            timeout: 100000,
            srcData: data
        }
    }, function(err, stdout){
            if (err) {
                return callbacks.error(err)
            };
            callbacks.success(stdout)
    })
}

var resize = function(data, width, quality, callbacks){
    im.resize({
        srcData: data,
        width: width,
        quality: quality,
        sharpening: 0.2
    }, function(err, stdout, stderr) {
        
        if (err) {
            return callbacks.error(err)
        };
        
        // meta
        im.readMetadata({'data': data}, function(err, metadata) {
        
            if (err) {
                return callbacks.error(err)
            };
            
            callbacks.success(stdout, metadata)
            });
        });
}

function firecrest(opts, success, err) {
 
    var data = '',
        width = opts.width || 100,
        height = opts.height || 100,
        quality = opts.quality || 0.1,
        geom = opts.geom || null,
        callbacks = { success: success, error: err },
        options = {
            host: opts.host,
            path: opts.path,
            port: opts.port || 80,
            method: 'GET'
            }

    http.get(options, function(response) {
        
        response.setEncoding('binary');
        
        response.on('data', function(chunk) {
            data += chunk;
        });
        
        response.on('end', function () {
            
            if (response.statusCode != 200) {
                return callbacks.error({ message: 'response code was ' + response.statusCode });
            }

            if (!geom) {
                resize(data, width, quality, callbacks);
            } else {
                crop(data, geom, callbacks);
            }

        })

    });
}

exports.get = firecrest;
