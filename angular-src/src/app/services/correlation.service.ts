import { Injectable } from '@angular/core';

@Injectable()
export class CorrelationService {

  constructor() { }

  sHashTable(tweetArray: Object[]) {
    tweetArray.forEach(element => {
      
    });

  }

  getMaxDistance(m1, tArray) {
    let maxD = [];
    console.log("Finding Max");
    function getMaxOfArray(numArray) {
      return Math.max.apply(null, numArray);
    }
    for (var i = 0; i< tArray.length; i++) {
      for (var j = 0; j < tArray.length; j++) {
        if (j != i) {
          var curMax = this.getDistanceSimilarity(tArray[i], tArray[j]);
          maxD.push(curMax);
        }
      }
    }
    return getMaxOfArray(maxD);
  }

  deg2rad(deg) {
    return deg * (Math.PI/180)
  }

  getSimilaritySum(m1, tArray, a) {
    console.log("getting sim sum");
    let sLat = m1.Latitude;
    let sLng = m1.Longitude;
    let sTag = m1.Tags;
    let sTid = m1.TweetId;
    let maxDistance = this.getMaxDistance(m1, tArray);
    let simSum = 0;
    for (var i = 0; i < tArray.length; i++) {
      if (sTid != tArray[i].TweetId) {
        var sim = this.getCosineSimilarty(sTag, tArray[i].Tags);
        var dist = this.getDistanceSimilarity(m1, tArray[i]);
        simSum += a*(dist/maxDistance) + (1-a)*sim; //Normalize Distance and add it with cossim using a as the selected weight
      }
    }
    return simSum;
  }

  calculateSimilarity(m1, tArray, a) {
    console.log("Calculating Similarity");
    let sLat = m1.Latitude;
    let sLng = m1.Longitude;
    let sTag = m1.Tags;
    let sTid = m1.TweetId;
    let maxDistance = this.getMaxDistance(m1, tArray);
    for (var i = 0; i < tArray.length; i++) {
      if (sTid != tArray[i].TweetId) {
        var sim = this.getCosineSimilarty(sTag, tArray[i].Tags);
        tArray[i].CosSim = sim;
        var dist = this.getDistanceSimilarity(m1, tArray[i]);
        tArray[i].Distance = dist;
        tArray[i].NormalizedSim = a*(dist/maxDistance) + (1-a)*sim; //Normalize Distance and add it with cossim using a as the selected weight
      }
    }
    return tArray;
  }

  calculateCosineSimilarity(m1, tArray) {
    let sLat = m1.Latitude;
    let sLng = m1.Longitude;
    let sTag = m1.Tags;
    let sTid = m1.TweetId;
    for (var i = 0; i < tArray.length; i++) {
      if (sTid != tArray[i].TweetId) {
        var sim = this.getCosineSimilarty(sTag, tArray[i].Tags);
        tArray[i].Label = sim.toString();
        tArray[i].Similarity = sim;
      }
    }
    return tArray;
  }

  calculateDistanceSimilarity(m1, tArray) {
    let sTid = m1.TweetId;
    for (var i = 0; i < tArray.length; i++) {
      var dist = this.getDistanceSimilarity(m1, tArray[i]);
      tArray[i].Label = dist.toString();
    }
    return tArray;
  }

  //get distance between two points(latlng)
  getDistanceSimilarity(m1, m2) {
    let m1Lat = m1.Latitude;
    let m1Lng = m1.Longitude;
    let m2Lat = m2.Latitude;
    let m2Lng = m2.Longitude;

    var R = 6371; //Radius of the earth in km
    var dLat = this.deg2rad(m2Lat-m1Lat);  // deg2rad below
    var dLon = this.deg2rad(m2Lng-m1Lng); 
    var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.deg2rad(m1Lat)) * Math.cos(this.deg2rad(m2Lat)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
  }

  //get cossim between two vectors
  getCosineSimilarty(s1, s2) {
    let sArray1 = [];
    let sArray2 = [];
    let sumArray = [];
    let v1 = [];
    let v2 = [];
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
    sArray1 = s1.split(',');
    sArray2 = s2.split(',');
    for (var i=0; i<sArray1.length; i++) {
      if (!sumArray.includes(sArray1[i])) {
        sumArray.push(sArray1[i]);
      } 
    };
    for (var j=0; j<sArray2.length; j++) {
      if (!sumArray.includes(sArray2[j])) {
        sumArray.push(sArray2[j]);
      } 
    }; 
    v1 = this.constructVector(sArray1, sumArray);
    v2 = this.constructVector(sArray2, sumArray);
    let dot = this.dotProduct(v1, v2);
    let magV1 = this.getMagnitude(v1);
    let magV2 = this.getMagnitude(v2);
    let cosSim = dot/(magV1*magV2);
    return cosSim;
  }

  //Get substring vector
  constructVector(inputArray, masterArray) {
    var outputArray = [];
    for (var i = 0; i< masterArray.length; i++) {
      var subStrCount = 0;
      for (var k = 0; k < inputArray.length; k++) {
        if (masterArray[i] === inputArray[k]) {
          subStrCount++;
        }
      }
      outputArray.push(subStrCount);
    }
    return outputArray;
  }

  //Calculate dot product between two vectors
  dotProduct(v1, v2) {
    let dotProduct = 0;
    if (v1.length != v2.length)  {
      console.log("Length mismatch!");
      return null;
    } else {
      for (var i = 0; i < v1.length; i++) {
        dotProduct += parseInt(v1[i]) * parseInt(v2[i]);
      }
    }
    return dotProduct;
  }

  getMagnitude(v) {
    let sum = 0;
    for (var i = 0; i < v.length; i++) {
      sum += v[i] * v[i];
    }
    let mag = Math.sqrt(sum);
    return mag;
  }

}
