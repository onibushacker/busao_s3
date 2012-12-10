//libraries
var path = require('path'),
    s3 = require('s3'),
    findit = require('findit');

//local setup
var BUILD_FOLDER = path.join(__dirname, '../www');

//setup from the conf files
var setup = {};
setup = require('../conf/s3_info');


var client = s3.createClient({
  key: setup.key,
  secret: setup.secret,
  bucket: setup.bucket,
  region: setup.region,
  secure: false
});

//iterate through all files on build folder
findit.find(BUILD_FOLDER,
  function uploadFile(fileName) {
    if (fileName.lastIndexOf('.') < fileName.lastIndexOf('/') + 2 ){ return; }
    var destination = fileName.substring(BUILD_FOLDER.length+1);
    // console.log(fileName.substring(BUILD_FOLDER.length+1));
    // upload a file to s3
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
})

// console.log(client);