'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var cors = require('cors');
var validator = require('validator')
var app = express();
//to work with id https://www.npmjs.com/package/mongoose-auto-increment
var autoIncrement = require('mongoose-auto-increment');

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
//connect with id incrementor
var connection = mongoose.createConnection(process.env.MONGO_URI);
autoIncrement.initialize(connection);
//mongoose.connect(process.env.MONGO_URI); 
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}))

var Schema=mongoose.Schema;

var shortUrlSchema = new Schema({
  url: {
    type: String,
    required: true
  }
})

var shortUrl = mongoose.model('shortUrl', shortUrlSchema);


 
//shortUrlSchema.plugin(autoIncrement.plugin, 'ShortUrl');

//var shortUrl = connection.model('shortUrl', shortUrlSchema)
shortUrlSchema.plugin(autoIncrement.plugin, 'shortUrl');
var shortUrl = connection.model('shortUrl', shortUrlSchema);

shortUrlSchema.plugin(autoIncrement.plugin, 'shortUrl')

//const shortUrl = connection.model('shortUrl', shortUrlSchema)


//with this video to get url https://www.youtube.com/watch?v=5T1YDRWaa3k

// go ahead
const createAndSaveUrl = (newUrl, done) => {
  const shortUrl = new shortUrl({
    url: newUrl
  })
  shortUrl.save((err, data) => {
    if(err) return done(err)
    return done(null, data)
  })
}

const findOneByUrl = (newUrl, done) => {
  shortUrl.findOne({url: newUrl}, (err, data) => {
    if(err) return done(err)
    return done(null, data)
  })
}

const findURLByShortURL = (shortUrl, done) => {
  shortUrl.findById(shortUrl, (err, data) => {
    if(err) return done(err)
    return done(null, data)
  })
}



app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.post("/api/shorturl/new", function (req, res) {
  const newUrl = req.body.url
  
  if (validator.isURL(newUrl)) {
    findOneByUrl(newUrl, (err, data) => {
      data
        ? res.json({
            original_url: data.url,
            short_url: data._id
          })
        : createAndSaveUrl(newUrl, (err, data) => {
            res.json({
              original_url: newUrl,
              short_url: data._id
            })
          })
    })
  } else {
    res.json({error: 'invalid URL'})
  }
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  findURLByShortURL(req.params.shorturl, (err, data) => {
    res.redirect(data.url)
  })
})





app.listen(port, function () {
  console.log('Node.js listening ...');
});