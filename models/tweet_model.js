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
    latitude: {
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

TweetMetadata.getTweetInPolygon = (lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, sampleSize, callback) => {
    TweetMetadata.find(
        {
           Location: {
                $geoWithin: {
                    $geometry: {
                        type : "Polygon" ,
                        coordinates: [ [ [lng1, lat1],[lng3, lat3],   [lng4, lat4], [lng2,lat2], [lng1, lat1] ] ]
                    }
                }
            }
        }, callback
    ).limit(sampleSize);
}