
var http = require('http'),
    querystring = require('querystring'),
    url = require('url'),
    argv = require('optimist').argv,
    firecrest = require('./lib/firecrest');

// catch (almost) all errors to help the server stay alive
process.on('uncaughtException', function (res, err) {
    console.log('Caught exception: ' + err);
});
    
// in url space '+' characters are whitespace
function fix_geom(geom) {
    return (geom) ? geom.replace(/\s/gi, '+') : geom;
}

// most of these options are to disallow any old tom, dick and harry to use your service 
var conf = {
    timeout: argv.timeout || 1000, // fail fast. keep this short to stop requests from backing up
    cacheLength: argv.cache || 31536000, // seconds. cache-control headers on outbound (TODO: obey origin server?)
    host: argv.host || null, // only allow images from this origin host name
    port: argv.port || 1337, // port to listen for http on 
    variations: {
            width: argv.width, // TODO: only allow these widths & compressions
            quality: argv.quality
        }
}

http.createServer(function (req, res) {
    
    var request = url.parse(req.url, true),
        w = request.query.width || 100,
        g = request.query.geom || null,
        q = request.query.quality || 0.5,
        u = url.parse(request.path.substring(1)),
        options = {
            width: w,
            geom: fix_geom(g),
            quality: q,
            host: u.host,
            path: u.pathname,
            timeout: conf.timeout
          }
        
    // scope to a host
    if (conf.host && u.host !== conf.host) {
        console.log(u.host + ' does not match the allowed host of ' + conf.host);
        res.writeHead(404);
        res.end();
    }

    firecrest.get(options, function(stdout, meta) {
        
        res.writeHead(200, {
            'Content-Length': stdout.length,
            'Cache-Control': 'max-age=' + conf.cacheLength,
            'Content-Type': 'image/jpeg'
        });

        res.write(stdout, 'binary');
        res.end();

    }, function(err) {
        console.log(err);
    })

}).listen(conf.port, '127.0.0.1');

