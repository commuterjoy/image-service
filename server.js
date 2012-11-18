
var im = require('imagemagick'),
    http = require('http'),
    querystring = require('querystring'),
    url = require('url');

function Proxy(path, res, width, quality) {
    
    var data = '',
        options = {
            host: 'static.guim.co.uk',
            port: 80,
            path: path,
            method: 'GET'
            }

    http.get(options, function(response) {
        
        response.setEncoding('binary');
        
        response.on('data', function(chunk) {
            data += chunk;
        });
        
        response.on('end', function () {
            
            im.resize({
                srcData: data,
                width: width,
                quality: quality,
                sharpening: 0.2
            }, function(err, stdout, stderr) {
                if (err) throw err;
                res.write(stdout, 'binary');
                res.end();
                });
        })

    });
}

http.createServer(function (req, res) {
    var u = url.parse(req.url, true),
        w = u.query.width || 100,
        q = u.query.quality || 0.5;
    
    if (u.pathname === '/favicon.ico') return false;

    res.writeHead(200, {'Content-Type': 'image/jpeg'});
    Proxy(u.pathname, res, w, q)

}).listen(1337, '127.0.0.1');



