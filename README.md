
Proxies HTTP requests for images via imagemagick with Node.js.

Most responsive design image techniques require multiple renderings
provided by the server.

This is a simple proxy server that lets clients request
images from an origin server and specify the format, size and compression
ratio they want the server to (dynamically) give them.

ref: http://www.alistapart.com/articles/responsive-images-how-they-almost-worked-and-what-we-need/

Usage
-----

```
brew install imagemagick
npm install imagemagick
node server.js
curl -i 'http://127.0.0.1:1337/http://news.bbcimg.co.uk/media/images/64233000/jpg/_64233885_lorries_bbc.jpg?width=400&quality=0.1'
```

Setup
-----

For scale, you'll want to set youselves up like this,

```
Client -> Cache -> Proxy Origin -> Image Origin
```

The client (Eg, a web browser) requests an image, which travels through a 
cache (Eg, a CDN). If the cache misses it then requests the image from the
origin server, which in turn fetches the source image (Eg, PNG) from a server before 
returning it, transformed, with cache headers, ready for the next request.

Requirements
------------

- Fetch a JPG, PNG, GIF image from an origin server over HTTP 
- Avoid disk I/O (we have a lot of images and can use caches in front of the application)
- Apply a configuration to each image (Eg, 50% resize, 0.2 compression)
- Scope to a set of known hosts
- Serialise as base64

Notes
-----

- Crops. Simply resizing a large image to a small one is often not good enough as
  the detail the photo is designed to convey is lost. To counter this the images is reframed,
  or cropped, to focus on the sujbct - Eg, specify a _x, y_ and a width will let the proxy server
  dynamically crop out the desired portion of the image without having to store multiple copies).
- Watermarking. Often images require copyright annotation. Adding this at source and
  then resizing them will make the text illegible.  
- Montage. The HTTP overhead of requesting many small images (especially from a single host) is 
  quite large. We may wish to request several images montaged in to a single larger image 
  and use CSS to reposition on the client (essentially a sprite is what I'm talking about).
- How do infographics, maps, graphics with writing on differ? 
- Maybe the client specifying a size, in bytes, for the image is better than the (JPG) quality.

