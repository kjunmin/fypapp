const express = require('express');
const router = express.Router();
const TweetController = require('../controllers/tweet_controller');

router.post('/gettweets', TweetController.getTweetsByUser);
router.post('/gettweetsc', TweetController.getTweetsByCountry);
router.post('/addtweet', TweetController.addTweet);
router.post('/gettweetscircle', TweetController.getTweetsInCircle);

module.exports = router;