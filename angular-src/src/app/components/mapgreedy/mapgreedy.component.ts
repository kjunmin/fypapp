import { Component, OnInit, NgModule, ViewChild, AfterViewInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { TweetmarkerService } from '../../services/tweetmarker.service';
import { CorrelationService } from '../../services/correlation.service';
import { TweethandlerService } from '../../services/tweethandler.service';
import { AgmCoreModule, GoogleMapsAPIWrapper, AgmInfoWindow, AgmDataLayer, CircleManager, AgmCircle } from '@agm/core';

declare var google:any;

@Component({
  selector: 'app-mapgreedy',
  templateUrl: './mapgreedy.component.html',
  styleUrls: ['./mapgreedy.component.css']
})
export class MapgreedyComponent implements OnInit {

  private map:any;

  @ViewChild(GoogleMapsAPIWrapper) private gmapWrapper: GoogleMapsAPIWrapper;
  displayedTweetArray: Object[];
  lastTweetArray: Object[];
  lastTweetWindowArray: Object[];
  myLat: number;
  myLng: number;
  myLabel: string;
  lastClickedCircle: any;
  sliderSampleSize: number;
  sliderDisplayNum: number;

  constructor(
    private agmCircle: AgmCircle,
    private circleManager: CircleManager,
    private tweetmarkerService: TweetmarkerService, 
    private correlationService: CorrelationService,
    private flashMessagesService: FlashMessagesService,
  ) { 
    this.myLabel = "YOU ARE HERE";
    this.myLat = 1.3553794;
    this.myLng = 103.86774439999999;
    this.lastClickedCircle = null;
    this.sliderSampleSize = 200;
    this.sliderDisplayNum = 10;
  }


  ngOnInit() {
    this.gmapWrapper.panTo({lat: this.myLat, lng:this.myLng});
  }

  test() {
    
  }

  naiveGreedy(O, alpha, k) {
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
    this.deleteMarkersFromMap(this.lastTweetArray);
    let tweetArray = [];
    S.forEach(element => {
      tweetArray.push(element.tweet);
    });
    return tweetArray;
  }

  //gets window tweet data (POLYGON)
  getTweetDataOnBoundsChange() {
    this.deleteMarkersFromMap(this.lastTweetWindowArray);
    this.getMapBounds(res => {
      this.getTweetsInPolygon(res.northEastBounds.lat, res.northEastBounds.lng, 
        res.northWestBounds.lat, res.northWestBounds.lng,
        res.southEastBounds.lat, res.southEastBounds.lng, 
        res.southWestbounds.lat, res.southWestbounds.lng, data => {
          var k = this.naiveGreedy(data, 0.5, 10);
          this.lastTweetWindowArray = this.displayTweetsInArray(k);
      });
      // var tAr = this.naiveGreedy(tA , 0.5, 10);
      // this.displayTweetsInArray(tAr);
    }); 
  }

  getTweetsInPolygon(lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, callback){
    let sampleSize = this.sliderSampleSize;
    let tweetArray = [];
    let polygonVal = {
      lat1: lat1,
      lng1: lng1,
      lat2: lat2,
      lng2: lng2,
      lat3: lat3,
      lng3: lng3,
      lat4: lat4,
      lng4: lng4,
      sampleSize: sampleSize
    }
    this.tweetmarkerService.getTweetsInPolygon(polygonVal).subscribe(data => {
      if (data.success) {
        console.log(data.output);
        let arrSize = ( data.output.length > this.sliderSampleSize ? this.sliderSampleSize: data.output.length);
        callback(data.output);
      } else {
        this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout:3000})
      }
    });
  }

  // selectGreedy(k) {
  //   //Sort the array in increasing Similarity to form a max heap
  //   function sortHeap(heap) {
  //     return heap.sort((a,b) => {
  //       return parseFloat(a.similarity) - parseFloat(b.similarity);
  //     })
  //   }

  //   let S = null;
  //   let H = [];
  //   let count = 0;
  //   O.forEach(element => {
  //     count++;
  //     let tuple = {
  //       tweet: element,
  //       similarity: this.correlationService.getSimilaritySum(element, O, 0.5),
  //       iteration: 0,
  //       id: count
  //     }
  //     H.push(tuple);
  //   });
  //   H = sortHeap(H);
  //   for (var step = 0; S.length < k && H.length > 0; step++) {
  //     let t = H.pop();
  //     var topId = t.count;
  //     while (t.iteration != step) {
        
  //     }
  //   }
  //   while(S.length < k && H.length != 0) {
  //     let t = H.pop();
  //     let cnt = 0;
  //     while (cnt != S.length) {
  //     }
  //   }
        
  // }

  createMarker(object) {
    var _self = this;
    var mLatLng = new google.maps.LatLng(object.Latitude, object.Longitude);
  
    var marker = new google.maps.Marker({
        position: mLatLng,
    });
    marker.setAnimation(google.maps.Animation.DROP);
    marker.info = this.createInfoWindow(object, mLatLng);
    google.maps.event.addListener(marker, 'click', function() {   //On clicking a marker
      if (this.tweetArray !== null) {
        // _self.compareSimWithMarker(object);     
      }
                            //Execute similarity calculation
      marker.info.open(this.gmapWrapper, marker);                 //And open the info window for the marker
    });
    return marker;
  }

  displayTweetsInArray(tweetArray) {
    let windowArray = [];
    tweetArray.forEach(element => {
      let marker = this.createMarker(element);
      this.gmapWrapper.createMarker(marker).then(res => {
        windowArray.push(res);
      })
    });
    return windowArray;
  }


  //Delete tweet markers from map
  deleteMarkersFromMap(mArray) {
    console.log("Deleting Markers");
    if (mArray == null || mArray == undefined) {
      return;
    } else {
      mArray.forEach(element => {
        element.setMap(null);
      });
    }
    this.lastTweetArray = null;
    this.lastTweetWindowArray = null;
  }

  //Slider 
  onSliderSampleChange(value) {
    this.sliderSampleSize = Math.round(value);
  }

  onSliderDisplayChange(value) {
    this.sliderDisplayNum = Math.round(value);
  }

  //Pan to latlng position on map
  centerMap(position) {
    this.gmapWrapper.panTo(position);
  }

  //Draw circle of radius x at latlng position
  drawCircle(position, radius) {
    if (this.lastClickedCircle) {
      this.lastClickedCircle.setMap(null);
      this.lastClickedCircle = null;
    }
    var circleOptions = {
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      center: position,
      radius: radius
    };
    this.gmapWrapper.createCircle(circleOptions).then(res => {
      // Get circle promise from createCircle API method call and store reference as last circle
      this.lastClickedCircle = res;
    });
  }

  createInfoWindow(marker, position) {
    var info = new google.maps.InfoWindow({
      content: "<div class='tweet-window-container'> \
                  <ul class='list-group'> \
                      <li class='list-group-item'><h5>User:</h5> " + marker.Screenname + "</li> \
                      <li class='list-group-item'><h5>text:</h5> " + marker.Text + "</li> \
                      <li class='list-group-item'><h5>Tags:</h5> " + marker.Tags + "</li> \
                  </ul> \
              </div>",
      position: position
    })
    return info;
  }

  //returns a json object with mapbounds
  getMapBounds(callback) {
    let _this = this;
    this.gmapWrapper.getBounds().then(data => {
      let windowInfo = data.toJSON();
      // console.log(windowInfo);
      let bounds = {
        northEastBounds: {lat: windowInfo.north, lng: windowInfo.east},
        southEastBounds: {lat: windowInfo.south, lng: windowInfo.east},
        northWestBounds: {lat: windowInfo.north, lng: windowInfo.west},
        southWestbounds: {lat: windowInfo.south, lng: windowInfo.west}
      }
      callback(bounds)
    });
  }
  
}
