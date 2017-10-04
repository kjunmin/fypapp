const mongoose = require('mongoose');
const dbconfig = require('../config/database_config');

const TweetMetadataSchema = mongoose.Schema({
    tid:{
        type: String,
        require: true
    },
    
    createtime: {
        type: String,
        require: true
    },
    text: {
        type: String,
        require: true
    },
    hashtags: {
        type: String,
        require: false
    },
    tags: {
        type: String,
        require: false
    },
    lat: {
        type: Number,
        require: true
    },
    lon: {
        type: Number,
        require: true
    },
    placeid: {
        type: String,
        require: false
    },
    placefullname: {
        type: String,
        require: false
    },
    country: {
        type: String,
        require: false
    },
    screenname: {
        type: String,
        require: true
    },
    ulang: {
        type: String,
        require: false
    },
    ulocation: {
        type: String,
        require: false
    },
    timestamp: {
        type: String,
        require: true
    }
});

const TweetMetadata = module.exports = mongoose.model('tweetdata', TweetMetadataSchema, 'tweetdata');

//Temporary Hard limit
let tweetLimit = 1000;

module.exports.getTweetById = (id, callback) => {
    let query = {_id: id};
    TweetMetadata.find(query, callback);
}

module.exports.getAllTweets = (callback) => {
    let query = {};
    TweetMetadata.find(query, callback);
}

module.exports.addTweet = (newTweet, callback) => {
    newTweet.save(callback);
}

module.exports.getTweetsByUser = (username, callback) => {
    let query = { screenname: username };
    TweetMetadata.find(query, callback);
}

module.exports.getTweetsByCountry = (country, callback) => {
    let query = { country: country };
    TweetMetadata.find(query, callback).limit(tweetLimit);
}