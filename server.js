'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser')
var cors = require('cors');
var validator = require('validator')
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
mongoose.connect(process.env.MONGO_URI); 
app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}))

var Schema=mongoose.Schema;

const shortUrlSchema = new Schema({
  url: {
    type: String,
    required: true
  }
})

var ShortURL = mongoose.model('shortUrl', shortUrlSchema);
//with this video to get url https://www.youtube.com/watch?v=5T1YDRWaa3k
app.get("/new/:urlToShort(*)",function(req,res,next){
        var urlToShort=req.params.urlToShort;  
  return res.json({urlToShort})
  console.log(urlToShort)
        })

const createAndSaveURL = (newURL, done) => {
  const shortUrl = new ShortURL({
    url: newURL
  })
  shortUrl.save((err, data) => {
    if(err) return done(err)
    return done(null, data)
  })
}

const findOneByURL = (newURL, done) => {
  ShortURL.findOne({url: newURL}, (err, data) => {
    if(err) return done(err)
    return done(null, data)
  })
}

const findURLByShortURL = (shortURL, done) => {
  ShortURL.findById(shortURL, (err, data) => {
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
  const newURL = req.body.url
  
  if (validator.isURL(newURL)) {
    findOneByURL(newURL, (err, data) => {
      data
        ? res.json({
            original_url: data.url,
            short_url: data._id
          })
        : createAndSaveURL(newURL, (err, data) => {
            res.json({
              original_url: newURL,
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