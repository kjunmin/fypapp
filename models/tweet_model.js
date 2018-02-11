const mongoose = require('mongoose');
const dbconfig = require('../config/database_config');

const TweetMetadataSchema = mongoose.Schema({
    TweetId:{
        type: String,
        require: true
    },
    CreateTime: {
        type: String,
        require: true
    },
    Text: {
        type: String,
        require: true
    },
    Hashtags: {
        type: String,
        require: false
    },
    Tags: {
        type: String,
        require: false
    },
    Latitude: {
        type: Number,
        require: true
    },
    Longitude: {
        type: Number,
        require: true
    },
    Location: {
        coordinates: {
            type: Object
        },
        require:false
    },
    PlaceId: {
        type: String,
        require: false
    },
    PlaceFullname: {
        type: String,
        require: false
    },
    Country: {
        type: String,
        require: false
    },
    Screenname: {
        type: String,
        require: true
    },
    Language: {
        type: String,
        require: false
    }
});

const TweetMetadata = module.exports = mongoose.model('tweetdata', TweetMetadataSchema, 'tweetdata');

//Temporary Hard limit
let tweetLimit = 1000;

TweetMetadata.getTweetById = (id, callback) => {
    let query = {_id: id};
    TweetMetadata.find(query, callback);
}


TweetMetadata.addTweet = (newTweet, callback) => {
    newTweet.save(callback);
}

TweetMetadata.getTweetsByUser = (username, callback) => {
    let query = { Screenname: username };
    TweetMetadata.find(query, callback);
}

TweetMetadata.getTweetsByCountry = (country, callback) => {
    let query = { Country: country };
    TweetMetadata.find(query, callback).limit(tweetLimit);
}

TweetMetadata.getTweetInCircle = (lat, lng, minDistance, maxDistance, sampleSize, callback) => {
    TweetMetadata.find(
        {
            Location: {
                $near: { 
                    $geometry: { 
                        type: "Point",
                        coordinates: [ lng, lat ] 
                    },
                    $minDistance: minDistance,
                    $maxDistance: maxDistance
                }
            } 
        }, callback).limit(sampleSize);
}

TweetMetadata.getTweetInPolygon = (neLat, neLng, nwLat, nwLng, seLat, seLng, swLat, swLng, sampleSize, callback) => {
    TweetMetadata.find(
        {
           Location: {
                $geoWithin: {
                    $geometry: {
                        type : "Polygon" ,
                        coordinates: [ [ [neLng, neLat], [seLng, seLat],   [swLng, swLat], [nwLng, nwLat], [neLng, neLat] ] ]
                    }
                }
            }
        }, callback
    ).limit(sampleSize);
}