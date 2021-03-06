//libraries
var path = require('path'),
    fs = require('fs-extra'),
    http = require('http'),
    zip = require("node-native-zip"), // we are using a fork https://github.com/onkis/node-native-zip not the one from npm see README notes
    findit = require('findit');

//local settings
var WAIT_DOWNLOAD = 500, //minimum time in miliseconds to wait before each download request
    PICTURE_SIZE = 0, //which jpeg version of each picture to download (0=highest, 1, 2, 3=smaller sizes)
    PAGE_ID = 'onibushacker',
    ALBUM_FOLDER_NAME = 'albums',
    PICTURE_FOLDER_NAME = 'photos',
    DATA_FOLDER_NAME = 'data',
    DATA_FOLDER = path.join(__dirname, '../',DATA_FOLDER_NAME),
    PICTURE_FOLDER = path.join(__dirname, '../',PICTURE_FOLDER_NAME),
    ALBUM_DATA_FOLDER = path.join(DATA_FOLDER, PAGE_ID, ALBUM_FOLDER_NAME),
    ALBUM_PICTURE_FOLDER = path.join(PICTURE_FOLDER, PAGE_ID, ALBUM_FOLDER_NAME);

//load albums list
var albumListJson = fs.readFileSync(path.join(ALBUM_DATA_FOLDER,'index.json'), 'utf-8'),
    albumListData = JSON.parse(albumListJson),
    albumsProcessed = 0;
    photoQueue = [],
    requestInterval = 0,
    downloadedPhotos = 0;

function createAlbumArchives(){
  albumListData.albums.data.forEach(
    function createAlbumArchive(album, index){
      var albumPath = path.join(ALBUM_PICTURE_FOLDER, album.id);
      //check if the folder exists
      fs.exists(albumPath, function(exists){
          if (exists){
            var files = [];
            //walk throug all files
            var finder = findit.find(albumPath,
              function updateFilesToZip(fileName){
                files.push({
                  name: fileName.substring(fileName.lastIndexOf('/')+1),
                  path: fileName,
                  compression: 'store'
                });
              }
            );//findit.find
            finder.on('end',function(){

              var archive = new zip()
              archive.addFiles(files, function () {
                  var buff = archive.toBuffer(function(result){
                    fs.writeFile(albumPath+".zip", result, function () {
                        console.log(albumPath+'.zip finished');
                    });
                  });
              }, function (err) {
                  console.log(err);
              });
            });
          }
      });
    } //createAlbumArchive
  );
}

function downloadNextPhoto(){
  var photoDownload = photoQueue.pop();

  if (typeof photoDownload === 'undefined') {
    // queue is empty
    clearInterval(requestInterval);
    createAlbumArchives();
    return false;
  }
  var photoFormat = photoDownload.url.substring(photoDownload.url.lastIndexOf('.'),photoDownload.url.lastIndexOf('?')),
      localPath = path.join(ALBUM_PICTURE_FOLDER, photoDownload.album_id, photoDownload.photo_id + photoFormat);

  fs.exists(localPath, function (exists) {
    if(!exists){
      var file = fs.createWriteStream(localPath);
      try{
        console.log('Downloading photo '+photoDownload.photo_id+' from album '+photoDownload.album_id);
        console.log(photoDownload.url);
        var request = http.get(photoDownload.url.replace('https', 'http'),
          function photoDownloadData(response) {
            response.pipe(file);
          }// photoDownloadData
        );
      }catch(e){
        console.log(e);
        console.log(photoDownload);
      }
    } else{
      // console.log(localPath + ' is here already.');
      downloadNextPhoto();
    }
  });
}

albumListData.albums.data.forEach(
  function processAlbum(album, index){
    try{
      var albumJson = fs.readFileSync(path.join(ALBUM_DATA_FOLDER, album.id, 'index.json'), 'utf-8'),
          albumData = JSON.parse(albumJson);
      //create album dir in the pictures folder
      fs.mkdirp(path.join(ALBUM_PICTURE_FOLDER, album.id),
        function albumPhotoDirCreated(err, folder) {
          if (err) { console.error(err); }
          //walk all phtotos in an album
          albumData.photos.data.forEach(
            function addPhotoToQueue(photo,index){
              photoQueue.push({
                'album_id': album.id,
                'photo_id': photo.id,
                'url': photo.images[PICTURE_SIZE].source
              });
            }// addPhotoToQueue
          );
          //check if all photos were included in the queue
          if (++albumsProcessed == albumListData.albums.data.length){
            console.log('start unqueueing');
            requestInterval = setInterval(downloadNextPhoto, WAIT_DOWNLOAD);
          }
        }
      );
    }catch(e){
      albumsProcessed++;
      if(e.errno == 34){
        console.log('empty album');
      }else{
        console.log(e);
      }
    }

  }
);

