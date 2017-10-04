const express = require('express');
const router = express.Router();
const TweetController = require('../controllers/tweet_controller');

router.post('/gettweets', TweetController.getTweetsByUser);
router.post('/gettweetsc', TweetController.getTweetsByCountry);
router.get('/getall', TweetController.getAllTweets);
router.post('/addtweet', TweetController.addTweet);

module.exports = router;