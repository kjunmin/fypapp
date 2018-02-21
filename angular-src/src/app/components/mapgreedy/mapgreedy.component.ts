import { Component, OnInit, NgModule, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { TweetmarkerService } from '../../services/tweetmarker.service';
import { CorrelationService } from '../../services/correlation.service';
import { AlgorithmService } from '../../services/algorithm.service';
import { MapWindow } from '../../models/window';
import { AgmCoreModule, GoogleMapsAPIWrapper, AgmInfoWindow, AgmDataLayer, CircleManager, AgmCircle } from '@agm/core';
import { Observable } from 'rxjs/Observable';
import { Promise } from 'q';
import { MapMarker } from '../../models/marker';


declare var google:any;

@Component({
  selector: 'app-mapgreedy',
  templateUrl: './mapgreedy.component.html',
  styleUrls: ['./mapgreedy.component.css']
})
export class MapgreedyComponent implements OnInit {

  private map:any;

  @ViewChild(GoogleMapsAPIWrapper) private gmapWrapper: GoogleMapsAPIWrapper;
  @ViewChild("content-box") private cBox
  displayedTweetArray: Object[];
  lastTweetArray: Object[];
  myLat: number;
  myLng: number;
  sliderSampleSize: number;
  sliderDisplayNum: number;
  sliderMinDistance: number;
  timeout: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private agmCircle: AgmCircle,
    private circleManager: CircleManager,
    private tweetmarkerService: TweetmarkerService, 
    private correlationService: CorrelationService,
    private flashMessagesService: FlashMessagesService,
    private algorithmService: AlgorithmService
  ) { 
    this.myLat = 1.3553794;
    this.myLng = 103.86774439999999;
    this.sliderSampleSize = 200;
    this.sliderDisplayNum = 10;
    this.sliderMinDistance = 2;
    this.timeout = 0;
    this.displayedTweetArray = [];
  }


  ngOnInit() { 
    this.gmapWrapper.panTo({lat: this.myLat, lng:this.myLng});
  }

  test() {
    let _self = this;
    function callback(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          let a = _self.createPlaceMarker(place);
          _self.gmapWrapper.createMarker(a);
          _self.gmapWrapper.panTo(place.geometry.location);
        }
      }
    this.gmapWrapper.getNativeMap().then(map => {
      let service = new google.maps.places.PlacesService(map);
      service.getDetails({placeId:'ChIJN1t_tDeuEmsRUsoyG83frY4'}, callback);
    })
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
        _self.algorithmService.selectGreedy(data.output, tweetArr, 0.5, arrSize, 0.02, data => {
          console.log("data output from greedy:")
          console.log(data);
          _self.displayTweetsInArray(data).then(res => {
              if (_self.lastTweetArray == undefined) {
                _self.lastTweetArray = res;
              }else {
                _self.lastTweetArray = _self.lastTweetArray.concat(res);
                // console.log("lastTweetArray");
                // console.log(_self.lastTweetArray);
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

  createPlaceMarker(place) {
    console.log(place);
    let image = {
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25)
    };

    let marker = new google.maps.Marker({
      icon: image,
      title: place.name,
      position: place.geometry.location
    });
    return marker;
  }


  createMarker(tweet) {
    var _self = this;
    var mLatLng = new google.maps.LatLng(tweet.Latitude, tweet.Longitude);
  
    var marker = new google.maps.Marker({
        position: mLatLng,
        tweet: tweet
    });
    marker.setAnimation(google.maps.Animation.DROP);
    marker.info = new MapMarker().createInfoWindow(tweet, mLatLng);
    google.maps.event.addListener(marker, 'click', function() {   //On clicking a marker
      _self.displayedTweetArray.push(tweet);
      _self.changeDetectorRef.detectChanges();
      marker.info.open(this.gmapWrapper, marker);                 //And open the info window for the marker
    });
    return marker;
  }

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

  onSliderDistanceChange(value) {
    this.sliderMinDistance = Math.round(value);
  }

  //returns a json object with mapbounds
  getMapBounds(callback) {
    let _this = this;
    this.gmapWrapper.getBounds().then(data => {
      let windowInfo = data.toJSON();
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
