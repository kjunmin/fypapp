import { Injectable } from '@angular/core';
import { CorrelationService } from './correlation.service';

@Injectable()
export class AlgorithmService {

  constructor(
    private correlationService:CorrelationService
  ) { }

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


  selectGreedy(O, alpha, k) {
    console.log("Begin select greedy algorithm");
    var start = new Date().getTime();
    function removeTweetFromArray(tweet, array) {
      var index = array.map(function(e) { return e.TweetId; }).indexOf(tweet.TweetId);
      if (index > -1) {
        array.splice(index, 1);
      }
      return array;
    }
    //Sort the array in increasing Similarity to form a max heap
    function sortHeap(heap) {
      return heap.sort((a,b) => {
        return parseFloat(a.similarity) - parseFloat(b.similarity);
      })
    }

    let S = [];

    let BigA = O;
    let H = [];
    BigA.forEach(element => {
      let tuple = {
        tweet: element,
        similarity: this.correlationService.getSimilaritySum(element, BigA, alpha),
        step: 0
      }
      H.push(tuple);
    });

    H = sortHeap(H);
    for (var step = 0; S.length < k; step++) {
      H = sortHeap(H);
      let t = H.pop();
      var topId = t.step;
      console.log(S.length);
      if (topId != step) {
        t.similarity = this.correlationService.getSimilaritySum(t.tweet, BigA, alpha);
        t.step = step+1;
        H.push(t);
      } else {
        S.push(t);
        BigA = removeTweetFromArray(t.tweet, BigA);
      }
    }
    console.log(S);
  //   // this.deleteMarkersFromMap(this.lastTweetArray);
    let tweetArray = [];
    S.forEach(element => {
      tweetArray.push(element.tweet);
    });
    var end = new Date().getTime();
    console.log("Server proc " + (end - start) + " milliseconds.")
    return tweetArray;   
  }

}
