
var http = require('http'),
    querystring = require('querystring'),
    url = require('url'),
    firecrest = require('./lib/firecrest');

http.createServer(function (req, res) {
    
    var request = url.parse(req.url, true),
        w = request.query.width || 100,
        q = request.query.quality || 0.5,
        u = url.parse(request.path.substring(1)),
        options = {
            width: w,
            quality: q,
            host: u.host,
            path: u.pathname
          }

    firecrest.get(options, function(stdout) {
            res.writeHead(200, {'Cache-Control': 'max-age=10'});
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.writeHead(200, {'X-I-Bytes': stdout.length});
            res.write(stdout, 'binary');
            res.end();
        }, function(err) {
            console.log(err);
        })

}).listen(1337, '127.0.0.1');

