const NLP = require('./nlp_handler.js');
var nlp = new NLP();

var selAlgo = class selAlgo {
    

    naiveGreedy(O, alpha, k) {
        var start = new Date().getTime();
        function removeTweetFromArray(tweet, array) {
          var index = array.map(function(e) { return e.TweetId; }).indexOf(tweet.TweetId);
          if (index > -1) {
            array.splice(index, 1);
          }
          return array;
        }
    
        function sortHeap(heap) {
          return heap.sort((a,b) => {
            return parseFloat(a.similarity) - parseFloat(b.similarity);
          })
        }
        
        let S = [];
    
        while (k >= S.length) {
          let BigA = O;
          let H = [];
          console.log(O.length);
          BigA.forEach(element => {
            let tuple = {
              tweet: element,
              similarity: nlp.getSimilaritySum(element, BigA, alpha)
            }
            H.push(tuple);
          });
          H = sortHeap(H);
          let topTuple = H.pop();
          BigA = removeTweetFromArray(topTuple.tweet, BigA);
          S.push(topTuple);
          
        }
        //console.log(S);
        let tweetArray = [];
        S.forEach(element => {
          tweetArray.push(element.tweet);
        });
        var end = new Date().getTime();
        console.log("Server proc " + (end - start) + " milliseconds.")
        return tweetArray;
    }
}

module.exports = selAlgo;
