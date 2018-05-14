import { Component, OnInit, NgModule, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { TweetmarkerService } from '../../services/tweetmarker.service';
import { CorrelationService } from '../../services/correlation.service';
import { AlgorithmService } from '../../services/algorithm.service';
import { MapWindow } from '../../models/window';
import { AgmCoreModule, GoogleMapsAPIWrapper, AgmInfoWindow, AgmDataLayer } from '@agm/core';
import { Observable } from 'rxjs/Observable';
import { Promise } from 'q';
import { MapMarker } from '../../models/marker';
import { PlaceMarker } from '../../models/places';
import { request } from 'd3';


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
  lastPlaceArray: Object[];
  displayedPlaceArray: Object[];
  myLat: number;
  myLng: number;
  sliderSampleSize: number;
  sliderDisplayNum: number;
  sliderMinDistance: number;
  timeout: any;

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private tweetmarkerService: TweetmarkerService, 
    private correlationService: CorrelationService,
    private flashMessagesService: FlashMessagesService,
    private algorithmService: AlgorithmService
  ) { 
    this.myLat = 1.3553794;
    this.myLng = 103.86774439999999;
    this.sliderSampleSize = 200;
    this.sliderDisplayNum = 10;
    this.sliderMinDistance = 15;
    this.timeout = 0;
    this.displayedTweetArray = [];
    this.displayedPlaceArray = [];
    this.lastPlaceArray = [];
  }


  ngOnInit() { 
    this.gmapWrapper.panTo({lat: this.myLat, lng:this.myLng});
  }

  test() {
    let _self = this;
    let mapWindow = new MapWindow(this.tweetmarkerService).getLatLngBounds(this.gmapWrapper).then(bounds => {
      _self.gmapWrapper.getNativeMap().then(map => {
        var request = {
          bounds : bounds,
          type: ['restaurant']
        };
        let service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, callback);
      })
    });
    function callback(results, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          for (var i = 0; i < results.length; i++) {
            console.log(results[5]);
            var place = _self.createPlaceMarker(results[i]);
            _self.gmapWrapper.createMarker(place);
            _self.gmapWrapper.panTo(results[i].geometry.location);
          }
        }
      }
  }

  mapSettle() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      var start = new Date().getTime();
      this.getTweetDataOnBoundsChange();
      // this.getPlaceDataOnBoundsChange();
      var end = new Date().getTime();
      console.log("Server Traversal " + (end - start) + " milliseconds.")
     } , 2000); //Get tweet data once map has been in idle state for 2 seconds
  }


  getPlaceDataOnBoundsChange() {
    let _self = this;

    if (this.lastPlaceArray != undefined) {
      this.deletePlacesFromMap(this.lastPlaceArray);
    }

    function containsPlace(pArray, place) {
      let q = Promise((resolve, reject)=>{
        let k = false;
        pArray.forEach(element => {
          if (element.id == place.id) {
            k = true;
          }
        });
        resolve(k);
      });
      return q; 
      
    }

    function getArrayDisplay(results, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (let i = 0; i < (results.length - _self.lastPlaceArray.length); i++) {
          _self.displayedPlaceArray.push(results[i]);
          let place = _self.createPlaceMarker(results[i]);
          containsPlace(_self.lastPlaceArray, place).then(res => {
            if (!res) {
              _self.gmapWrapper.createMarker(place).then(res => {
                _self.lastPlaceArray.push(res);
              });
            }
          })
          
        }
        console.log(_self.lastPlaceArray);
      }
    }
    
    let mapWindow = new MapWindow(this.tweetmarkerService).getLatLngBounds(this.gmapWrapper).then(bounds => {
      _self.gmapWrapper.getNativeMap().then(map => {
        let request = {
          // keyword : "wind",
          bounds : bounds,
          rankBy: google.maps.places.RankBy.PROMINENCE
        };
        let service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, getArrayDisplay);
      })
    });
    console.log(this.lastPlaceArray);
  }

  //gets window tweet data (POLYGON)
  getTweetDataOnBoundsChange() {
    let _self = this;

    if (this.lastTweetArray != undefined){
      this.deleteTweetsFromMap(this.lastTweetArray);
    }
    
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
    let mWindow = new MapWindow(this.tweetmarkerService).getMapBounds(this.gmapWrapper).then( map => {
      map.getTweetsInWindow(this.sliderSampleSize).subscribe(data => {
        if (data.success) {
          getArrayDisplay(data, this.sliderDisplayNum, this.lastTweetArray);
        } else {
          this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout:3000})
        }
      })
    });
  }

  createPlaceMarker(place) {
    var _self = this;
    let image = {
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    var pLatLng = new google.maps.LatLng(place.Latitude, place.Longitude);
    let marker = new google.maps.Marker({
      id: place.id,
      icon: image,
      title: place.name,
      position: place.geometry.location
    });
    marker.setAnimation(google.maps.Animation.DROP);
    marker.info = new PlaceMarker().createInfoWindow(place, pLatLng);
    google.maps.event.addListener(marker, 'click', function() {   //On clicking a marker
      //TODO: Add onclick event to google place
      console.log(place);
      _self.changeDetectorRef.detectChanges();
      marker.info.open(this.gmapWrapper, marker);  
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

  displayPlacesInArray(placeArray): Promise<any> {
    console.log("creating " + placeArray.length + "new Places");
    let q = Promise<any>((resolve, reject)=>{
      var windowArray = [];
      placeArray.forEach(element => {
        let marker = this.createMarker(element);
        this.gmapWrapper.createMarker(marker).then(res => {
          windowArray.push(res);
        })
      });
      resolve(windowArray);
    });
    return q; 
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

  deletePlacesFromMap(pArray) {
    console.log("Deleting Places");
    let ltA = pArray.length;
    function removePlaceFromLastArray(element, array) {
      var index = array.map(function(e) { return e.id; }).indexOf(element.id);
      if (index > -1) {
        array.splice(index, 1);
      }
      return array;
    }

    this.gmapWrapper.getNativeMap().then(map => {
      if (pArray == null || pArray == undefined) {
        return;
      }else  {
        let count = 0;
        let newPlaceArray = this.lastPlaceArray.slice();
        pArray.forEach(element => {
          if (!map.getBounds().contains(element.getPosition())) {
            element.setMap(null);
            count++;
            newPlaceArray = removePlaceFromLastArray(element, newPlaceArray);
          }
        });
        console.log("Deletion completed: " + count + "places removed")
        console.log("lastPlaceArray from " + ltA + "=>" + newPlaceArray.length);
        console.log(newPlaceArray);
        this.lastPlaceArray = newPlaceArray.slice();
      }
    }) 
  }

  //Delete tweet markers from map
  deleteTweetsFromMap(tArray) {
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
        if (tArray == null || tArray == undefined) {
          return;
        }else  {
          let count = 0;
          let newTweetArr = this.lastTweetArray.slice();
          tArray.forEach(element => {
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
  
}
