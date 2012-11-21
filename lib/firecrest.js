
var im = require('imagemagick'),
    http = require('http');
 
function firecrest(opts, success, err) {
 
    var data = '',
        width = opts.width || 100,
        quality = opts.quality || 0.1,
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

            im.resize({
                srcData: data,
                width: width,
                quality: quality,
                sharpening: 0.2
            }, function(err, stdout, stderr) {
                
                if (err) {
                    return callbacks.err({ message: 'error processing image: ' + err })
                };
                
                // meta
                im.readMetadata({'data': data}, function(err, metadata) {
                    if (err) throw err;
                    callbacks.success(stdout, metadata)
                    });
                });
        })

    });
}

exports.get = firecrest;
