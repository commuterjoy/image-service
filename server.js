
var im = require('imagemagick'),
    http = require('http'),
    querystring = require('querystring'),
    url = require('url'),
    firecrest = require('./lib/firecrest');

http.createServer(function (req, res) {
    
    var u = url.parse(req.url, true),
        w = u.query.width || 100,
        q = u.query.quality || 0.5;

    firecrest.get(u.pathname, w, q, function(stdout) {
        res.writeHead(200, {'Cache-Control': 'max-age=10'});
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.writeHead(200, {'X-I-Bytes': stdout.length});
        res.write(stdout, 'binary');
        //res.write(new Buffer(stdout).toString('base64'));
        res.end();
    })

}).listen(1337, '127.0.0.1');

