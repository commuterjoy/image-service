
Proxies HTTP requests for images via imagemagick using Node.js.

Why?
----

Most [responsive design image techniques](http://www.alistapart.com/articles/responsive-images-how-they-almost-worked-and-what-we-need) require multiple renderings
provided by the server.

This is a simple proxy server that lets clients request
images from an origin server and specify the format, size and compression
ratio they want the server to given them back.

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
curl -i 'http://127.0.0.1:1337/http://news.bbcimg.co.uk/media/images/64233000/jpg/_64233885_lorries_bbc.jpg?width=400&quality=0.1'
```

_TODO: proper install notes, npm etc._

Setup
-----

For scale, you'll want to set youselves up like this,

```
Client -> Caching Proxy -> Image Proxy -> Image Origin
```

The client (Eg, a web browser) requests an image, which travels through a 
caching proxy (Eg, a CDN).

If the cache misses it then requests the image from the
image proxy server, which in turn fetches the source image (Eg, a PNG) from an origin server before 
returning it, transformed, with cache headers, ready for the next request.

Stick as many of these proxy origin servers in as you wish.

_TODO: publish some throughput statistics_

Crops 
-----

In responsive desing simply resizing a large image to a small one is often not good enough as
the detail the photo is designed to convey ends up lost.

To counter this the images is reframed,
or cropped, to focus on the subject - Eg, specify a _x, y_ and a width will let the proxy server
dynamically crop out the desired portion of the image without having to store multiple copies).

This is an origin image, of two Reverends.

![](docs/images/rev_original.jpg)

This is a crop, better suited to small viewports.

![](docs/images/rev_crop.jpg)

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

