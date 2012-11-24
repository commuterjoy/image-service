Proxies HTTP requests for images via imagemagick using Node.js.

Why?
----

Most [responsive design image techniques](http://www.alistapart.com/articles/responsive-images-how-they-almost-worked-and-what-we-need) require multiple renderings
provided by the server.

This is a simple proxy server that lets clients request
images from an origin server and specify the format, size and compression
ratio they want the server to give them back.

So, we request the image URL _http://news.bbcimg.co.uk/path/to/jpg_ and have it resized to 250px and apply a 50%
compression,

```
curl -i 'http://127.0.0.1:1337/http://news.bbcimg.co.uk/path/to/jpg?width=250&quality=0.5'
```

Requirements
------------

- Fetch a JPG, PNG, GIF image from an origin server over HTTP.
- Work over a standard HTTP GET (Ie, inline images requests are naturally _GETs_).
- Avoid disk I/O (we have a lot of images and can use plain old HTTP caches in front of the application).
- Apply a configuration to each image (Eg, 50% resize, 0.2 compression).

Usage
-----

OS X instructions only so far,

```
brew install imagemagick
npm install imagemagick
node server.js
curl -i 'http://127.0.0.1:1337/http://news.bbcimg.co.uk/path/to/jpg?width=400&quality=0.1'
```

_TODO: proper install notes, npm etc._

Configuration
------------

You can configure each instance of the HTTP service when starting the server, Eg.

```
node server.js --timeout 2000 --port 8080 
```

Options in full,

- --timeout _n_ - Time allowed before the request to the origin server expires. Defaults to 1000ms.
- --cache _n_ - The max-age value of the outbound cache-control header. Defaults to 31536000 (1 year).
- --host _example.com_ - Disallows any request to the image origin server _not_ from the given domain. This allows each instance to process only your images. 
- --port _n_ - The port you want to listen for connections on. Defaults to 1337.
- --exif - Sends the image's EXIF metadata in the response headers

Setup
-----

For scale, you'll want to set youselves up like this,

```
Client -> Caching Proxy -> Load Balancer -> Image Proxy Server(s) -> Image Origin
```

The client (Eg, a web browser) requests an image, which travels through a caching proxy (Eg, a CDN).

If the cache misses it then requests the image from the
image proxy server(s) sat behind a load balancer, which in turn fetch the source image (Eg, a PNG) from an origin server.

The origin server returns the JPG/PNG and the the image proxy transforms it, adds some cache headers and responds to the CDN.

Stick as many of these image proxy servers in as you wish.

Benchmark
---------

I can cycle over 200 unique 30kb source images at a rate of *50 requests p/sec* on a 2.4Ghz MacBook with 4GB RAM.

The performance largely depends on the size of images you are fetching processing.

The system is stateless and scale horizontally ad infinitum, so do that if you want 1000's of
requests p/sec, or more.

Here's the siege report,

```
Transactions:             1594 hits
Availability:             100.00 %
Elapsed time:             29.31 secs
Data transferred:         5.95 MB
Response time:            0.35 secs
Transaction rate:         54.38 trans/sec
Throughput:               0.20 MB/sec
Concurrency:              19.20
Successful transactions:  1594
Failed transactions:      0
Longest transaction:      1.30
Shortest transaction:     0.08
```

Crop
----

In responsive design simply resizing a large image to a small one is often not good enough as
the detail the photo is designed to convey ends up lost.

To counter this problem the image is typically reframed,
or cropped, to focus on the subject - Eg, specify a _x, y_ and a _width_ will let the proxy server
dynamically crop out the desired portion of the image without having to store multiple copies).

This is an origin image, of two Reverends.

![](https://raw.github.com/commuterjoy/image-service/master/docs/images/rev_original.jpg)

This is a crop, better suited to small viewports.

![](https://raw.github.com/commuterjoy/image-service/master/docs/images/rev_crop.jpg)

The crop was produced by the client requesting a geometry within the image, Ie.

```
# generate a 200x120 image, 45px from the left and 65px from the top
http://127.0.0.1:1337/http://static.guim.co.uk/path/to/jpg?geom=200x120+45+65
```

And we can combine the crop though the resize action,

```
# as above, but resize the crop to 100x60 with 50% compression
http://127.0.0.1:1337/http://static.guim.co.uk/path/to/jpg?geom=200x120+45+65&width=100&quality=0.5
```

To-do
----

- Watermarking and montages (more below).
- Serialise the output as base64.
- Better testing around PNG (including alpha), GIF (bounce to PNG) etc.
- Configuration - timeoouts, scope requests to a host, fixed number of variations, cache-control times etc.

Watermarking
------------

Often images require copyright annotation. Adding this at source and then resizing them will make the text illegible.  

A better solution is to store the copyright information in the EXIF metadata area of JPGs and PNGs, extract it
as the image is being served and render the text on to the image at a sensible size.

Montage
-------

The HTTP overhead of requesting many small images (especially from a single host) is 
quite large. We may wish to request several images montaged in to a single, larger image 
and use CSS to reposition on the client (essentially a sprite is what I'm talking about).


Firecrest
---------

A tiny, restless jewel of a bird ...

![](http://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Regulus_ignicapilla_Arundel.jpg/320px-Regulus_ignicapilla_Arundel.jpg)

