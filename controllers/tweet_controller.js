const Tweet = require('../models/tweet_model');

module.exports = {
    addTweet: (req, res, next) => {
        let newTweet = new Tweet({
            tid: req.body.tid,
            createtime: req.body.createtime,
            text: req.body.text,
            hashtags: req.body.hashtags,
            tags: req.body.tags,
            lat: req.body.lat,
            lon: req.body.lon,
            placeid: req.body.placeid,
            placefullname: req.body.placefullname,
            country: req.body.country,
            screenname: req.body.screenname,
            ulang: req.body.ulang,
            ulocation: req.body.ulocation,
            timestamp: req.body.timestamp
        });

        Tweet.addTweet( newTweet, (err, tweet) => {
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
        console.log(screenname);
        Tweet.getTweetsByUser(screenname, (err, tweet) => {
            if (err) throw err;
            if (tweet.length == 0) {
                return res.json({ success: false, output: "No tweets by user found!"});
            } else {
                return res.json({ success: true, output: tweet});
            }
        })
    },

    getTweetsByCountry: (req, res, next) => {
        let country = req.body.country;
        console.log(country);
        Tweet.getTweetsByCountry(country, (err, tweet) => {
            if (err) throw err;
            if (tweet.length == 0) {
                return res.json({ success: false, output: "No tweets by country found!"});
            } else {
                return res.json({ success: true, output: tweet});
            }
        })
    },

    getAllTweets: (req, res, next) => {
        Tweet.getAllTweets = (err, tweet) => {
            if (err) throw err;
            else return res.json({success: true, output: tweet})
        }
    },

    getTweetById: (req, res, next) => {
        Tweet.getTweetById('59d352f8ab60daa8ff6f0aaf', (err, tweet) => {
            if (err) throw err;
            if (tweet.length == 0) {
                res.json({ success: false, output: "No tweets by user found!"});
            } else {
                res.json({success: true, output: tweet});
            }
        })
    } 
}