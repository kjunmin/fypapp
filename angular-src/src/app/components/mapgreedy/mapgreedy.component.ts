import { Component, OnInit, NgModule, ViewChild, AfterViewInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { TweetmarkerService } from '../../services/tweetmarker.service';
import { CorrelationService } from '../../services/correlation.service';
import { TweethandlerService } from '../../services/tweethandler.service';
import { AlgorithmService } from '../../services/algorithm.service';
import { MapWindow } from '../../models/window';
import { AgmCoreModule, GoogleMapsAPIWrapper, AgmInfoWindow, AgmDataLayer, CircleManager, AgmCircle } from '@agm/core';
import { Observable } from 'rxjs/Observable';
import { Promise } from 'q';

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
  sliderSampleSize: number;
  sliderDisplayNum: number;
  timeout: any;

  constructor(
    private agmCircle: AgmCircle,
    private circleManager: CircleManager,
    private tweetmarkerService: TweetmarkerService, 
    private correlationService: CorrelationService,
    private flashMessagesService: FlashMessagesService,
    private algorithmService: AlgorithmService
  ) { 
    this.myLabel = "YOU ARE HERE";
    this.myLat = 1.3553794;
    this.myLng = 103.86774439999999;
    this.sliderSampleSize = 200;
    this.sliderDisplayNum = 10;
    this.timeout = 0;
  }


  ngOnInit() { 
    this.gmapWrapper.panTo({lat: this.myLat, lng:this.myLng});
  }

  test() {
  }

  mapSettle() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.getTweetDataOnBoundsChange();
     } , 2000); //Get tweet data once map has been in idle state for 2 seconds
  }

  //gets window tweet data (POLYGON)
  getTweetDataOnBoundsChange() {
    if (this.lastTweetArray != undefined){
      this.deleteMarkersFromMap(this.lastTweetArray);
    }
    var _self = this;
    function getArrayDisplay(data, sliderNum, tweetArr) {
      let arrSize = ( data.output.length > sliderNum ? sliderNum: data.output.length);
        _self.algorithmService.selectGreedy(data.output, tweetArr, 0.5, arrSize, data => {
          _self.displayTweetsInArray(data).then(res => {
              console.log("lastTweetArrayBefore");
              console.log(_self.lastTweetArray);
              console.log("CurrentTweetArray:");
              console.log(res);
              if (_self.lastTweetArray == undefined) {
                _self.lastTweetArray = res;
              }else {
                _self.lastTweetArray = _self.lastTweetArray.concat(res);
                console.log("lastTweetArray");
                console.log(_self.lastTweetArray);
              }
          })
        });
    }
    this.getMapBounds(res => {
      var mWindow = new MapWindow(this.tweetmarkerService, res.northEastBounds.lat, res.northEastBounds.lng, 
        res.northWestBounds.lat, res.northWestBounds.lng,
        res.southEastBounds.lat, res.southEastBounds.lng, 
        res.southWestbounds.lat, res.southWestbounds.lng);
        mWindow.getTweetsInWindow(this.sliderSampleSize).subscribe(data => {
        if (data.success) {
          getArrayDisplay(data, this.sliderDisplayNum, this.lastTweetArray);
        } else {
          this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout:3000})
        }
      })
    }); 
  }


  createMarker(object) {
    var _self = this;
    var mLatLng = new google.maps.LatLng(object.Latitude, object.Longitude);
  
    var marker = new google.maps.Marker({
        position: mLatLng,
        tweet: object
    });
    marker.setAnimation(google.maps.Animation.DROP);
    marker.info = this.createInfoWindow(object, mLatLng);
    google.maps.event.addListener(marker, 'click', function() {   //On clicking a marker
      if (this.tweetArray !== null) {
        // _self.compareSimWithMarker(object);     //Execute similarity calculation
      }             
      marker.info.open(this.gmapWrapper, marker);                 //And open the info window for the marker
    });
    return marker;
  }

  // displayTweetsInArray(tweetArray, callback) {
  //   console.log("creating " + tweetArray.length + "new Tweets");
  //   var windowArray = [];
  //   tweetArray.forEach(element => {
  //     let marker = this.createMarker(element);
  //     this.gmapWrapper.createMarker(marker).then(res => {
  //       windowArray.push(res);
  //       if (tweetArray.length == windowArray.length) {
  //         callback(windowArray);
  //       }
  //     })
  //   });
  // }

  displayTweetsInArray(tweetArray): Promise<any> {
    console.log("creating " + tweetArray.length + "new Tweets");
    let q = Promise<any>((resolve, reject)=>{
      var windowArray = [];
      tweetArray.forEach(element => {
        let marker = this.createMarker(element);
        this.gmapWrapper.createMarker(marker).then(res => {
          windowArray.push(res);
        })
      });
      resolve(windowArray);
    });
    return q; 
  }

  //Delete tweet markers from map
  deleteMarkersFromMap(mArray) {
    console.log("Deleting Markers...");
    console.log(this.lastTweetArray);
    let ltA = this.lastTweetArray.length;
    
    function removeTweetFromLastArray(element, array) {
      var index = array.map(function(e) { return e.tweet.TweetId; }).indexOf(element.tweet.TweetId);
      if (index > -1) {
        array.splice(index, 1);
      }
      return array;
    }
    this.gmapWrapper.getNativeMap().then(map => {
        if (mArray == null || mArray == undefined) {
          return;
        }else  {
          let count = 0;
          let newTweetArr = this.lastTweetArray.slice();
          mArray.forEach(element => {
            if (!map.getBounds().contains(element.getPosition())) {
              element.setMap(null);
              count++;
              newTweetArr = removeTweetFromLastArray(element, newTweetArr);
            }
          });
          console.log("Deletion completed: " + count + "markers removed")
          console.log("lastTweetArray from " + ltA + "=>" + newTweetArr.length);
          console.log(newTweetArr);
          this.lastTweetArray = newTweetArr.slice();
        }
    }) 
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

  createInfoWindow(marker, position) {
    var info = new google.maps.InfoWindow({
      content: "<div class='tweet-window-container'> \
                  <ul class='list-group'> \
                      <li class='list-group-item'><h5>User:</h5> " + marker.Screenname + "</li> \
                      <li class='list-group-item'><h5>text:</h5> " + marker.Text + "</li> \
                      <li class='list-group-item'><h5>Tags:</h5> " + marker.Tags + "</li> \
                  </ul> \
              </div>",
      position: position,
      disableAutoPan: true
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
