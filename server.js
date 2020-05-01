'use strict';

var express = require('express');
var bodyParser = require('body-parser')
var mongo = require('mongodb');
var mongoose = require('mongoose');
//to work with id https://www.npmjs.com/package/mongoose-auto-increment
var autoIncrement = require('mongoose-auto-increment');
//to check if url is valid https://www.npmjs.com/package/valid-url
var validUrl = require('valid-url');

var cors = require('cors');
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.MONGOLAB_URI);

var connection = mongoose.createConnection(process.env.MONGO_URI,
                                           { useUnifiedTopology: true ,
                                            useNewUrlParser: true} )
//to work with id package
autoIncrement.initialize(connection)

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
//I looked at this project as well https://glitch.com/~fcc-api-project-url-shortener-microservice
app.use(bodyParser.urlencoded({ extended: false }))

/** set up mongoose schema **/
var Schema = mongoose.Schema

var shortUrlSchema = new Schema({
  url: {
    type: String,
    required: true
  }
})

//this for id package start with 100 and increment by 1

shortUrlSchema.plugin(autoIncrement.plugin, {
    model: 'shortUrl',
    startAt: 100,
    incrementBy: 1
});

var shortUrl = connection.model('shortUrl', shortUrlSchema);

var createUrl = function(newUrl, done) {
  var entryUrl = new shortUrl({
    url: newUrl})
   .save(function (err, data) {
      if(err) return done(err)
      return done(null, data)
  })
}

var findUrl = function (newUrl, done)  {
  shortUrl.findOne({url: newUrl}, function (err, data) {
    if(err) return done(err)
    return done(null, data)
  })
}

var findUrlById = function (shortUrl, done)  {
  shortUrl.findById(shortUrl, function (err, data)  {
    if(err) return done(err)
    return done(null, data)
  })
}

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  var newUrl = req.body.url
  //check if  validUrl variable
  if (validUrl.isUri(newUrl)) {
    findUrl(newUrl, function(err, data)  {
      if(data) {
         res.json({
            original_url: data.url,
            short_url: data._id
          })
      } else {
        createUrl(newUrl, function (err, data) {
            res.json({
              original_url: newUrl,
              short_url: data._id
            })
          })
      }
    })
  } else {
    res.json({error: 'invalid URL'})
  }
});

app.get('/api/shorturl/:shorturl', function (req, res) {
  findUrlById(req.params.shorturl, function (err, data) {
    res.redirect(data.url)
  })
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});