//libraries
var fs = require('fs-extra'),
    path = require('path'),
    mustache = require('mustache');

//local setup
var BUILD_FOLDER = path.join(__dirname, '../www'),
    TEMPLATE_FOLDER = path.join(__dirname, '../templates'),
    DATA_FOLDER = path.join(__dirname, '../data'),
    PAGE_NAME = 'onibushacker',
    STATIC_FOLDERS = ['css', 'js', 'img'];

//read the contents of the main json
var indexTemplate = fs.readFileSync(path.join(TEMPLATE_FOLDER,'index.html'), 'utf-8'),
    indexData = fs.readJSONFileSync(path.join(DATA_FOLDER,PAGE_NAME,'index.json')),
    coverData = fs.readJSONFileSync(path.join(DATA_FOLDER,PAGE_NAME,'cover.json')),
    albumListData = fs.readJSONFileSync(path.join(DATA_FOLDER,PAGE_NAME,'albums','index.json'));

//replace the cover image source with the bigger picture
indexData.cover.source = coverData.images[0].source;
indexData.cover.width = coverData.images[0].width;
indexData.cover.height = coverData.images[0].height;
indexData.albums = albumListData.albums.data;

//save the generated index.html
fs.writeFile(path.join(BUILD_FOLDER,'index.html'),
            mustache.render(indexTemplate, indexData),
  function indexSaved(err) {
    if (err) throw err;
    console.log('It\'s saved!');
  }
);

//copy static folders
STATIC_FOLDERS.forEach(
  function copyStaticFolder(folderName, index){
    fs.copy(path.join(TEMPLATE_FOLDER,folderName), path.join(BUILD_FOLDER,folderName),
      function folderCopied(err){
        if (err) { console.error(err); }
        else {
          console.log("Static folder "+ folderName +" copied.");
        }
      }
    );
  }//copyStaticFolder
);


// console.log(mustache.render(indexTemplate, indexData));
