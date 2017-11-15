//libraries
var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    fb = require("fb-js");
    // Iconv  = require('iconv').Iconv;

//local setup
var page_id = 'onibushacker',
    album_folder = 'albums',
    output_path = path.join(__dirname, '../data/'),
    page_path = path.join(output_path , page_id);

//setup from the conf files
var setup = {};
setup.oauthToken = require('../conf/facebook_token').oauthToken;

//facebook API client
var client = new fb(setup.oauthToken);

// get page info
client.api("GET", "/"+page_id,
  function pageInfoLoaded(err, result) {
    if (err) throw err;
    //request completed, create the local dir
    var file_path = path.join(page_path , 'index.json');
    console.log('Page info loaded.');
    mkdirp(page_path,
      function pagePathCreated(err) {
        if (err) throw err;
        //local dir created, write the json file…
        fs.writeFile(file_path, JSON.stringify(result, null, 4),
          function pageInfoSaved(err) {
            if (err) throw err;
            console.log('Page info saved on: '+file_path);
          }
        );
        //…and load cover photo info
        client.api("GET", "/"+result.id,
          function coverInfoLoaded(err, result){
            if (err) throw err;
            //write the cover photo json file
            var file_path = path.join(page_path , 'cover.json');
            fs.writeFile(file_path, JSON.stringify(result, null, 4),
              function coverInfoSaved(err) {
                if (err) throw err;
                console.log('Cover photo info saved on: '+file_path);
              }
            );
          }// coverInfoLoaded
        );

      } //pagePathCreated
    );
  } //pageInfoLoaded
);

// get albums info
client.api( "GET", "/"+page_id, { fields: "albums" },
  function albumsListLoaded(err, result) {
    if (err) throw err;
    //request completed, loop throug all albums
    console.log('Albums list retrieved.');
    var albumsCount = result.albums.data.length,
        albumsInfoSaved = albumsProcessed = 0,
        photosCount = remainingPhotos = 0,
        file_path = path.join(page_path,album_folder,'index.json');
    //write the json index file…
    var albums_path = path.join(page_path,'albums');
    mkdirp(albums_path,
      function albumsPathCreated(err){
        fs.writeFile(file_path, JSON.stringify(result, null, 4),
          function albumListInfoSaved(err) {
            if (err) throw err;
            console.log('Album list info saved on: '+file_path);
          }// albumListInfoSaved
        );
      }// albumsPathCreated
    );
    result.albums.data.forEach (
      function processAlbum(album,index){
        var album_path = path.join(page_path , album_folder, album.id),
            file_path = path.join(album_path, 'index.json');
        // request all photos
        client.api("GET", "/"+album.id, { fields: "photos{id,created_time,images}" },
          function photoInfoLoaded(err, result) {
            if (err) throw err;
            albumsProcessed++;
            if (typeof result.photos != "undefined"){
              this.album.photos = result.photos;
              //create the album local dir
              mkdirp(album_path,
                function albumPathCreated(err) {
                  if (err) throw err;
                  // write the json file…
                  fs.writeFile(this.file_path, JSON.stringify(this.album, null, 4),
                    function albumInfoSaved(err) {
                      if (err) throw err;
                      // console.log('album '+ this.album.id +' saved!');
                      if (++albumsInfoSaved == albumsCount){
                        console.log(albumsCount + ' albums info saved.');
                      }
                    }.bind({'album': this.album}) // albumInfoSaved
                  );
                }.bind({'album':this.album, 'file_path':this.file_path}) // albumPathCreated
              );
            } else{
              console.log('Album '+ this.album_path +' is empty.');
              albumsInfoSaved++;
            }
          }.bind({ // photoInfoLoaded
              'album': album,
              'album_path': album_path,
              'file_path': file_path})
        );
      } // processAlbum
    )
  }// albumsListLoaded
);


//helpers

// function fileSafeName(name){
//   var iconv = new Iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE');
//   return iconv.convert(name).toString()
//                   .replace(/[ .]+/gi,'_')
//                   .replace(/[^a-z0-9_]/gi, '')
//                   .replace(/\_+/gi,'_');
// }
