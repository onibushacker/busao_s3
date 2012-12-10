//libraries
var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');


//local settings
var MAX_DOWNLOADS = 3, //number of maximum number of photos being downloaded at once
    WAIT_DOWNLOAD = 1000, //minimum time in miliseconds to wait before each download request
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
    photoQueue = [];

albumListData.albums.data.forEach(
  function processAlbum(album, index){
    try{
      var albumJson = fs.readFileSync(path.join(ALBUM_DATA_FOLDER, album.id, 'index.json'), 'utf-8'),
          albumData = JSON.parse(albumJson);
      albumData.photos.data.forEach(
        function addPhotoToQueue(photo,index){
          photoQueue.push({
            'album_id': album.id,
            'photo_id': photo.id,
            'url': photo.images[PICTURE_SIZE].source
          });
        }// addPhotoToQueue
      );
    }catch(e){
      if(e.errno == 34){
        console.log('empty album');
      }else{
        console.log(e);
      }
    }

  }
);

function downloadNextPhoto(){
  console.log(photoQueue.pop());
}

var requestInterval = setInterval(downloadNextPhoto, WAIT_DOWNLOAD);