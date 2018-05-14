import { Injectable } from '@angular/core';
import { CorrelationService } from './correlation.service';

@Injectable()
export class AlgorithmService {

  constructor(
    private correlationService:CorrelationService
  ) { 
  }

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
          similarity: this.correlationService.getSimilaritySum(element, BigA, alpha)
        }
        H.push(tuple);
      });
      H = sortHeap(H);
      let topTuple = H.pop();
      BigA = removeTweetFromArray(topTuple.tweet, BigA);
      S.push(topTuple);
      
    }
    console.log(S);
    // this.deleteMarkersFromMap(this.lastTweetArray);
    let tweetArray = [];
    S.forEach(element => {
      tweetArray.push(element.tweet);
    });
    var end = new Date().getTime();
    console.log("Server proc " + (end - start) + " milliseconds.")
    return tweetArray;
  }


  selectGreedy(O, lastO, alpha, k, distT, callback) {
    console.log("Begin select greedy algorithm");
    var start = new Date().getTime();
    var _self = this;
    if (lastO == undefined) {
      lastO = [];
    }
    
    function removeTweetFromArray(tweet, array) {
      var index = array.map(function(e) { return e.TweetId; }).indexOf(tweet.TweetId);
      if (index > -1) {
        array.splice(index, 1);
      }
      return array;
    }

    function removeTweetFromHeap(tweetArray, array) {
      console.log("removing tweet");
      let p = new Promise<any>((resolve, reject) => {
        tweetArray.forEach(el => {
          var index = array.map(function(e) { return e.TweetId; }).indexOf(el.tweet.TweetId);
          if (index > -1) {
            console.log("Tweet removed");
            array.splice(index, 1);
          }
        });
        resolve(array);
      })
      return p;
    }
    //Sort the array in increasing Similarity to form a max heap
    function sortHeap(heap) {
      return heap.sort((a,b) => {
        return parseFloat(a.similarity) - parseFloat(b.similarity);
      })
    }

    function removeNearTargets(tweet, sArray): Promise<any> {
      let p = new Promise ((resolve, reject) => {
        sArray.forEach(element => {
          let distance = _self.correlationService.getDistance(element.tweet, tweet);
            if (distance < distT) {
              console.log("Too close!");
              sArray = removeTweetFromArray(tweet, sArray);
            }
        });
        resolve(sArray);
      })
      return p;
    }

    function isWithinDistance(tweet, sArray) {
      let p = new Promise ((resolve, reject) => {
        let bRes = false;
        sArray.forEach(element => {
          let distance = _self.correlationService.getDistance(element.tweet, tweet);
          if (distance < .05) {
            console.log("Too close!");
            bRes = true;
          }
        });
        resolve(bRes);
      })
      return p;
    }

    let S = [];
    let lO = lastO.slice();
    let BigA = O.slice();
    let H = [];
    
    //number of new tweets to be generated 
    k = k-lO.length;
    if (lO != undefined) {

      //remove any instance of elements from last instance still in window
      removeTweetFromHeap(lO, BigA).then(res => {
        res.forEach(element => {
      
          let tuple = {
            tweet: element,
            similarity: this.correlationService.getSimilaritySum(element, BigA, alpha),
            step: 0
          }
          H.push(tuple);
        });

        H = sortHeap(H);
        console.log("Generating " + k + " new tweets")
        for (let step = 0; S.length < k; step++) {
          H = sortHeap(H);
          let t = H.pop();
          // S.forEach(element => {
          //   if (element.tweet.TweetId == t.tweet.TweetId) {
          //     console.log("present");
          //   }
          // });
          if (t.step != step) {
            t.similarity = this.correlationService.getSimilaritySum(t.tweet, BigA, alpha);
            t.step = step+1;
            H.push(t);
          } else {
            S.push(t);
          }      
        }
        let tweetArray = [];
        S.forEach(element => {
          tweetArray.push(element.tweet);
        });
        var end = new Date().getTime();
        console.log("Algorithm complete, returning " + tweetArray.length + "tweets");
        console.log("Server proc " + (end - start) + " milliseconds.")
        callback(tweetArray);
      })
    }
    
    
    

       
  }

}
