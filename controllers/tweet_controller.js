const Tweet = require('../models/tweet_model');
const SelAlgo = require('../handlers/selection_algorithm.js');

module.exports = {
    addTweet: (req, res, next) => {
        let newTweet = new Tweet({
            TweetId: req.body.tid,
            CreateTime: req.body.createtime,
            Text: req.body.text,
            Hashtags: req.body.hashtags,
            Tags: req.body.tags,
            Latitude: req.body.lat,
            Longitude: req.body.lon,
            PlaceId: req.body.placeid,
            PlaceFullname: req.body.placefullname,
            Country: req.body.country,
            Screenname: req.body.screenname,
            Language: req.body.ulang,
        });

        Tweet.addTweet( newTweet, (err, results) => {
            if (err) {
                throw err;
                // res.json({success: false, output: 'Failed to register tweet.'});
            } else {
                res.json({success: true, output: 'New tweet added!'});
            }
        })
    },

    getTweetsByUser: (req, res, next) => {
        let screenname = req.body.screenname;
        Tweet.getTweetsByUser(screenname, (err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                return res.json({ success: false, output: "No tweets by user found!"});
            } else {
                return res.json({ success: true, output: results});
            }
        })
    },

    getTweetsByCountry: (req, res, next) => {
        let country = req.body.country;
        Tweet.getTweetsByCountry(country, (err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                return res.json({ success: false, output: "No tweets by country found!"});
            } else {
                return res.json({ success: true, output: results});
            }
        })
    },

    getTweetById: (req, res, next) => {
        Tweet.getTweetById('59d352f8ab60daa8ff6f0aaf', (err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                res.json({ success: false, output: "No tweets by user found!"});
            } else {
                res.json({success: true, output: results});
            }
        })
    },

    getTweetsInCircle: (req, res, next) => {
        let latitude = req.body.lat;
        let longitude = req.body.lng;
        let minDistance = req.body.mindistance;
        let maxDistance = req.body.maxdistance;
        let sampleSize = req.body.sampleSize;
        Tweet.getTweetInCircle(latitude, longitude, minDistance, maxDistance, sampleSize, (err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                res.json({ success: false, output: "No tweets found in specified area!"});
            } else {
                res.json({ success: true, output: results});
            }
        }) 
    },

    getTweetsInPolygon: (req, res, next) => {
        let lat1 = req.body.lat1;
        let lng1 = req.body.lng1;
        let lat2 = req.body.lat2;
        let lng2 = req.body.lng2;
        let lat3 = req.body.lat3;
        let lng3 = req.body.lng3;
        let lat4 = req.body.lat4;
        let lng4 = req.body.lng4;
        let sampleSize = req.body.sampleSize;
        Tweet.getTweetInPolygon(lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, sampleSize, (err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                res.json({ success: false, output: "No tweets found in specified area!"});
            } else {
                res.json({ success: true, output: results});
            }
        })
    },

    getRepresentativeArray: (req, res, next) => {
        let lat1 = req.body.lat1;
        let lng1 = req.body.lng1;
        let lat2 = req.body.lat2;
        let lng2 = req.body.lng2;
        let lat3 = req.body.lat3;
        let lng3 = req.body.lng3;
        let lat4 = req.body.lat4;
        let lng4 = req.body.lng4;
        let sampleSize = req.body.sampleSize;
        Tweet.getTweetInPolygon(lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, sampleSize, (err, results) => {
            if (err) throw err;
            if (results.length == 0) {
                res.json({ success: false, output: "No tweets found in specified area!"});
            } else {
                var tArray = selAlgo.naiveGreedy(results, 0.5, 5)
                //console.log(tArray);
                res.json({ success: true, output: results});
            }
        })
    }
}