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

Setup
-----

For scale, you'll want to set youselves up like this,

```
Client -> Caching Proxy -> Load Balancer -> Image Proxy -> Image Origin
```

The client (Eg, a web browser) requests an image, which travels through a 
caching proxy (Eg, a CDN).

If the cache misses it then requests the image from the
image proxy server(s) sat behind a load balancer, which in turn fetch the source image (Eg, a PNG) from an origin server.

The origin server returns the JPG/PNG and the the image proxy transforms it, adds some cache headers and responds to the CDN.

Stick as many of these proxy image servers in as you wish.

Benchmark
---------

Cycling over 200 unique images at a rate of 50 requests p/sec on a 2.4Ghz MacBook with 4GB RAM.

The performance
is ok, but largely depends on the size of images you are fetching processing.
The boxes are stateless and scale horizontally, so do that if you want 1000's of
requests p/sec.

Here's the siege report,

```
Transactions:               1594 hits
Availability:             100.00 %
Elapsed time:              29.31 secs
Data transferred:           5.95 MB
Response time:              0.35 secs
Transaction rate:          54.38 trans/sec
Throughput:             0.20 MB/sec
Concurrency:               19.20
Successful transactions:        1594
Failed transactions:               0
Longest transaction:            1.30
Shortest transaction:           0.08
```

Crops 
-----

In responsive desing simply resizing a large image to a small one is often not good enough as
the detail the photo is designed to convey ends up lost.

To counter this the images is reframed,
or cropped, to focus on the subject - Eg, specify a _x, y_ and a width will let the proxy server
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

To-do
----

- Watermarking and  montages (more below).
- Serialise the output as base64.
- Better testing around PNG (including alpha), GIF (bounce to PNG) etc.
- Pipeline, Eg, crop -> resize -> b+w etc.
- Expose meta data in the response some way, Eg, _X-_ headers ?
- Configuration - scope requests to a host, fixed number of variations, cache-control times etc.

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

