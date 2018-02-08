var natural = require('natural');

var correlationHandler = class correlationHandler {

    test() {
        var tokenizer = new natural.WordTokenizer();
        console.log(tokenizer.tokenize("your dog has fleas."));
        // [ 'your', 'dog', 'has', 'fleas' ]
    }

    tokenizeAndStem(text) {
        natural.PorterStemmer.attach();
        return text.tokenizeAndStem();
    }

    //get distance between two points(latlng) in kilometers
    getDistance(m1, m2) {
        function deg2rad(deg) {
            return deg * (Math.PI/180)
        }
        let m1Lat = m1.Latitude;
        let m1Lng = m1.Longitude;
        let m2Lat = m2.Latitude;
        let m2Lng = m2.Longitude;

        var R = 6371; //Radius of the earth in km
        var dLat = deg2rad(m2Lat-m1Lat);  // deg2rad below
        var dLon = deg2rad(m2Lng-m1Lng); 
        var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(m1Lat)) * Math.cos(deg2rad(m2Lat)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        var d = R * c; // Distance in km
        return d;
    }

    getMaxDistance(tArray) {
        let maxD = [];
        function getMaxOfArray(numArray) {
          return Math.max.apply(null, numArray);
        }
        for (var i = 0; i< tArray.length; i++) {
          for (var j = 0; j < tArray.length; j++) {
            if (j != i) {
              var curMax = this.getDistance(tArray[i], tArray[j]);
              maxD.push(curMax);
            }
          }
        }
        return getMaxOfArray(maxD);
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
        v.forEach(el => {
            sum += el * el;
        }); 
        return Math.sqrt(sum);
    }

    //get cossim between two vectors
    getCosineSimilarty(s1, s2) {
        function constructVector(inputArray, masterArray) {
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

        let sumArray = [];
        let cosSim = 0;
        let sArray1 = this.tokenizeAndStem(s1);
        let sArray2 = this.tokenizeAndStem(s2);
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
        let v1 = constructVector(sArray1, sumArray);
        let v2 = constructVector(sArray2, sumArray);
        let dot = this.dotProduct(v1, v2);
        // console.log("dot:" + dot);
        let magV1 = this.getMagnitude(v1);
        // console.log("v1:" + magV1);
        let magV2 = this.getMagnitude(v2);
        // console.log("v2:" + magV2);
        cosSim = dot/(magV1*magV2);
        return cosSim;
    }

    calculateSimilarity(m1, tArray, a) {
        console.log("Calculating Similarity");
        let sLat = m1.Latitude;
        let sLng = m1.Longitude;
        let sTag = m1.Tags;
        let sTid = m1.TweetId;
        let maxDistance = this.getMaxDistance(tArray);
        for (var i = 0; i < tArray.length; i++) {
          if (sTid != tArray[i].TweetId) {
            var sim = this.getCosineSimilarty(sTag, tArray[i].Tags);
            tArray[i].CosSim = sim;
            var dist = this.getDistance(m1, tArray[i]);
            tArray[i].Distance = dist;
            tArray[i].NormalizedSim = a*(dist/maxDistance) + (1-a)*sim; //Normalize Distance and add it with cossim using a as the selected weight
          }
        }
        return Observable.create(observer => {
          observer.next(tArray);
          observer.complete();
        });
    }

    getSimilaritySum(m1, tArray, a) {
        let sLat = m1.Latitude;
        let sLng = m1.Longitude;
        let sTag = m1.Tags;
        let sTid = m1.TweetId;
        let maxDistance = this.getMaxDistance(tArray);
        let simSum = 0;
        for (var i = 0; i < tArray.length; i++) {
          if (sTid != tArray[i].TweetId) {
            var sim = this.getCosineSimilarty(sTag, tArray[i].Tags);
            var dist = this.getDistance(m1, tArray[i]);
            let simN = a*(dist/maxDistance) + (1-a)*sim; //Normalize Distance and add it with cossim using a as the selected weight
            simSum += simN;
          }
        }
        return simSum; //Return max similarity value
      }
}

module.exports = correlationHandler;