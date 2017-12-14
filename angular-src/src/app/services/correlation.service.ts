import { Injectable } from '@angular/core';

@Injectable()
export class CorrelationService {

  constructor() { }

  sHashTable(tweetArray: Object[]) {
    tweetArray.forEach(element => {
      
    });

  }

  calculateCosineSimilarty(s1, s2) {
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
    console.log("V1:" + sArray1);
    console.log("V2:"+ sArray2);
    console.log("MasterArray:" + sumArray);
    v1 = this.constructVector(sArray1, sumArray);
    v2 = this.constructVector(sArray2, sumArray);
    let dot = this.dotProduct(v1, v2);
    console.log("DotP: " + dot);
    let magV1 = this.getMagnitude(v1);
    console.log("MagV1: " +magV1);
    let magV2 = this.getMagnitude(v2);
    console.log("MagV2: " +magV2);
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
    console.log(v);
    let sum = 0;
    for (var i = 0; i < v.length; i++) {
      sum += v[i] * v[i];
    }
    let mag = Math.sqrt(sum);
    return mag;
  }

  levenshteinSimilarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength === 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
  }

  editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = [];
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

}
