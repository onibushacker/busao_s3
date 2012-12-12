//libraries
var path = require('path'),
    fs = require('fs'),
    s3 = require('s3'),
    knox = require('s3/node_modules/knox'),
    findit = require('walkdir');

//local setup
var BUILD_FOLDER = path.join(__dirname, '../www'),
    PHOTO_FOLDER = path.join(__dirname, '../photos'),
    ROOT_FOLDER = path.join(__dirname, '../'),
    SIMULTANEOUS_UPLOADS = 4,
    UPLOAD_INTERVAL = 200;

//setup from the conf files
var setup = {};
setup = require('../conf/s3_info');


var s3Options = {
      key: setup.key,
      secret: setup.secret,
      bucket: setup.bucket,
      region: setup.region,
      secure: false
    },
    client = s3.createClient(s3Options),
    knoxClient = knox.createClient(s3Options),
    s3FileSizes = {},
    uploadQueue = [],
    uploadInterval = 0,
    uploadsInProgress = 0;

//grab information about the existing files on S3
knoxClient.list({ prefix: '' },
  function s3ListLoaded(err, data){
    if (err) { console.error(err); }
    data.Contents.forEach(
      function eachS3File(fileInfo, index){
        s3FileSizes[fileInfo.Key] = fileInfo.Size;
      } // eachS3File
    );
    //iterate through all files on build folder
    var finder = findit.find(BUILD_FOLDER, {follow_symlinks:true},
      function queueFileUpload(fileName, stats) {
        //ignore . files such as .DS_Store
        if (fileName.lastIndexOf('.') < fileName.lastIndexOf('/') + 2 ){ return; }
        var destination = fileName.substring(BUILD_FOLDER.length+1);
        if (fileName.indexOf(PHOTO_FOLDER) != -1){
          destination = fileName.substring(ROOT_FOLDER.length);
        }
        //check if the file is there already (same size)
        if (stats.size != s3FileSizes[destination]){
          //file changed, upload again
          uploadQueue.push({
            file:fileName,
            destination:destination
          });
        } else {
          // console.log(destination + ' has the same size as the local version, not updating.');
        }
    })// queueFileUpload
    finder.on('end', function(){
      console.log(uploadQueue.length + ' files to upload…');
      uploadInterval = setInterval(uploadNextFile, UPLOAD_INTERVAL);
    });
  } // s3ListLoaded
);

function uploadNextFile(){
  if (uploadsInProgress == SIMULTANEOUS_UPLOADS) { return false; }
  uploadsInProgress ++;
  var fileToUpload = uploadQueue.pop();
  if (typeof fileToUpload === 'undefined') {
    // queue is empty
    clearInterval(uploadInterval);
    console.log('Done.');
    return false;
  }
  console.log(fileToUpload);
  var uploader = client.upload(fileToUpload.file, fileToUpload.destination);
  uploader.on('error', function(err) {
    console.error("unable to upload:", err.stack);
    uploadsInProgress --;
  });
  uploader.on('progress', function(amountDone, amountTotal) {
    console.log("progress", amountDone, amountTotal);
  });
  uploader.on('end', function() {
    uploadsInProgress --;
    console.log("done");
  });
}