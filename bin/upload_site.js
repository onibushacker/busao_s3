//libraries
var path = require('path'),
    fs = require('fs'),
    s3 = require('s3'),
    knox = require('s3/node_modules/knox'),
    findit = require('findit');

//local setup
var BUILD_FOLDER = path.join(__dirname, '../www');

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
    s3FileSizes = {};

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
    findit.find(BUILD_FOLDER,
      function uploadFile(fileName) {
        //ignore . files such as .DS_Store
        if (fileName.lastIndexOf('.') < fileName.lastIndexOf('/') + 2 ){ return; }
        var destination = fileName.substring(BUILD_FOLDER.length+1);
        //check if the file is there already (same size)
        fs.stat(fileName,
          function localFileInfoRetrieved(err, stats){
            if (err) { console.error(err); }
            if (stats.size != s3FileSizes[destination]){
              //file changed, upload again
              var uploader = client.upload(fileName, destination);
              uploader.on('error', function(err) {
                console.error("unable to upload:", err.stack);
              });
              uploader.on('progress', function(amountDone, amountTotal) {
                console.log("progress", amountDone, amountTotal);
              });
              uploader.on('end', function() {
                console.log("done");
              });
            } else {
              console.log(destination + ' has the same size as the local version, not updating.');
            }
          }// localFileInfoRetrieved
        );
    })
  } // s3ListLoaded
);

