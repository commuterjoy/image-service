
var firecrest = require('../lib/firecrest'),
    nock = require('nock');

describe('Firecrest', function(){
  
  it('Should fetch an image from an origin server and resize it', function(){
      
      var bytes,
          done = false,
          jpg = nock('http://static.guim.co.uk')
            .get('/firecrest.jpg')
            .replyWithFile(200, __dirname + '/fixtures/firecrest.jpg', {
                'Content-Type': 'image/jpeg'
            });

      var bytes,
          done = false;
      
      var options = {
          host: 'static.guim.co.uk',
          path: '/firecrest.jpg',
          port: 80,
          width: 1
      }

      firecrest.get(options, function(src) {
        bytes = src.length;
        done = true;
        })
    
      waitsFor(function(){
        return done;
        }, "image not loaded",  100)
  
      runs(function() {
        expect(bytes).toBe(285);
      }) 

   });

  it('Should adjust the quality of JPEGs images', function() {
      
      var bytes,
          done = false,
          jpg = nock('http://static.guim.co.uk')
            .get('/firecrest.jpg')
            .replyWithFile(200, __dirname + '/fixtures/firecrest.jpg', {
                'Content-Type': 'image/jpeg'
            });
      
      var options = {
          host: 'static.guim.co.uk',
          path: '/firecrest.jpg',
          width: 2,
          quality: 0.8
      }

      firecrest.get(options, function(src) {
        bytes = src.length;
        done = true;
        })
    
      waitsFor(function(){
        return done;
        }, "image not loaded",  500)
  
      runs(function() {
        expect(bytes).toBe(295);
      }) 

  });

  it('Should only process non-HTTP 200 response codes from the origin server', function() {
      
      var bytes,
          errorMessage,
          done = false,
          fourOhFour = nock('http://static.guim.co.uk')
            .get('/not-here')
            .reply(404);
 
      var options = {
          host: 'static.guim.co.uk',
          path: '/not-here',
      }

      firecrest.get(options, function(src) {
        }, function(err){
            errorMessage = err.message;
            done = true;
        })

      waitsFor(function(){
        return done;
        }, "error callback not invoked",  500)
  
      runs(function() {
        expect(errorMessage).toBe('response code was 404');
      }) 
  });

  it('Should expose image meta-data', function() {
      
      var bytes,
          meta,
          done = false,
          jpg = nock('http://static.guim.co.uk')
            .get('/milburn.jpg')
            .replyWithFile(200, __dirname + '/fixtures/milburn.jpg', {
                'Content-Type': 'image/jpeg'
            });
 
      var options = {
          host: 'static.guim.co.uk',
          path: '/milburn.jpg'
      }

      firecrest.get(options, function(src, m) {
            meta = m;
            done = true;
        }, function(err){
        })

      waitsFor(function(){
        return done;
        }, "error callback not invoked",  500)
  
      runs(function() {
        expect(meta.exif.exposureTime).toBe('1/160');
      }) 
  });

});
