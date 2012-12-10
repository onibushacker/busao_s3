//libraries
var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    mustache = require('mustache');

//local setup
var BUILD_FOLDER = path.join(__dirname, '../www'),
    TEMPLATE_FOLDER = path.join(__dirname, '../templates'),
    DATA_FOLDER = path.join(__dirname, '../data'),
    PAGE_NAME = 'onibushacker';

//read the contents of the main json
var indexJson = fs.readFileSync(path.join(DATA_FOLDER,PAGE_NAME,'index.json'), 'utf-8'),
    coverJson = fs.readFileSync(path.join(DATA_FOLDER,PAGE_NAME,'cover.json'), 'utf-8'),
    albumListJson = fs.readFileSync(path.join(DATA_FOLDER,PAGE_NAME,'albums','index.json'), 'utf-8'),
    indexTemplate = fs.readFileSync(path.join(TEMPLATE_FOLDER,'index.html'), 'utf-8'),
    indexData = JSON.parse(indexJson),
    coverData = JSON.parse(coverJson),
    albumListData = JSON.parse(albumListJson);

//replace the cover image source with the bigger picture
indexData.cover.source = coverData.images[0].source;
indexData.albums = albumListData.albums.data;

//save the generated index.html
fs.writeFile(path.join(BUILD_FOLDER,'index.html'),
            mustache.render(indexTemplate, indexData),
  function indexSaved(err) {
    if (err) throw err;
    console.log('It\'s saved!');
  }
);

console.log(mustache.render(indexTemplate, indexData));
