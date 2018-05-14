import { Component, OnInit, NgModule, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { PoimarkerService } from '../../services/poimarker.service';
import { CorrelationService } from '../../services/correlation.service';
import { TweetmarkerService } from '../../services/tweetmarker.service';
import { AlgorithmService } from '../../services/algorithm.service';
import { PlaceMarker } from '../../models/places';
import { AgmCoreModule, GoogleMapsAPIWrapper, AgmInfoWindow, AgmDataLayer, CircleManager, AgmCircle } from '@agm/core';
import { Observable } from 'rxjs/Observable';
import { Promise } from 'q';
import { MapWindow } from '../../models/window';

declare var google:any;

@Component({
  selector: 'app-mappoi',
  templateUrl: './mappoi.component.html',
  styleUrls: ['./mappoi.component.css']
})
export class MappoiComponent implements OnInit {

  private map:any;

  @ViewChild(GoogleMapsAPIWrapper) private gmapWrapper: GoogleMapsAPIWrapper;
  displayedPoiArray: Object[];
  lastPoiArray: Object[];
  lastPoiWindowArray: Object[];
  myLat: number;
  myLng: number;
  myLabel: string;
  lastClickedCircle: any;
  tweetArray: any[];
  lastTweetCircleArray: any[];
  searchInput: string;
  sliderSampleSize: number;
  sliderSelectedSize: number;
  lastPlaceArray: Object[];
  displayedPlaceArray: Object[];

  constructor(
    private agmCircle: AgmCircle,
    private circleManager: CircleManager,
    private changeDetectorRef: ChangeDetectorRef,
    private tweetmarkerService: TweetmarkerService, 
    private correlationService: CorrelationService,
    private flashMessagesService: FlashMessagesService,
    private algorithmService: AlgorithmService
    

  ) { 
    this.myLabel = "YOU ARE HERE";
    this.myLat = 1.3553794;
    this.myLng = 103.86774439999999;
    this.lastClickedCircle = null;
    this.tweetArray = [];
    this.displayedPlaceArray = [];
    this.lastPlaceArray = [];
    this.sliderSampleSize = 200;
    this.sliderSelectedSize = 25;
  } 
  
  ngOnInit() { 
    this.gmapWrapper.panTo({lat: this.myLat, lng:this.myLng});
  }

  test(res) {
    this.deleteMarkersFromMap(this.lastTweetCircleArray);
    let lat = res.coords.lat;
    let lng = res.coords.lng;
    const position = new google.maps.LatLng(lat, lng);
    // this.centerMap(position);
    let searchRadius = 2000;
    this.drawCircle(position, searchRadius);
    let circleVal = {
      lat: lat,
      lng: lng,
      mindistance: 0,
      maxdistance: searchRadius,
      sampleSize: this.sliderSampleSize
    }
    this.tweetmarkerService.getTweetsInCircle(circleVal).subscribe(data => {
      console.log(data);
      let newArr = data.output.slice(0, this.sliderSelectedSize);
      this.tweetArray = newArr;
      this.lastTweetCircleArray = this.displayTweetsOnMap(newArr);
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
      _self.changeDetectorRef.detectChanges();
      marker.info.open(this.gmapWrapper, marker);  
    });
    return marker;
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
          keyword : this.searchInput,
          bounds : bounds,
          rankBy: google.maps.places.RankBy.PROMINENCE
        };
        let service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, getArrayDisplay);
      })
    });
    console.log(this.lastPlaceArray);
  }


  displayTweetsOnMap(tArray) {
    let tweetArray = [];
    tArray.forEach(element => {
      let marker = this.createMarker(element);
      this.gmapWrapper.createMarker(marker).then(res => {
        tweetArray.push(res);
      })
    });
    return tweetArray;
  }

  createMarker(object) {
    var _self = this;
    var mLatLng = new google.maps.LatLng(object.Latitude, object.Longitude);
  
    var marker = new google.maps.Marker({
        position: mLatLng,
    });
    marker.setAnimation(google.maps.Animation.DROP);
    google.maps.event.addListener(marker, 'click', function() {   //On clicking a marker
      if (this.tweetArray !== null) {
        // _self.compareSimWithMarker(object);     //Execute similarity calculation
      }             
      marker.info.open(this.gmapWrapper, marker);                 //And open the info window for the marker
    });
    return marker;
  }

   //Get tweets in an area
   getTweetsInCircle(lat, lng, minDistance, maxDistance, callback) {
    let sampleSize = 500;
    let tweetArray = [];
    let tweetArray2 = [];
    let circleVal = {
      lat: lat,
      lng: lng,
      mindistance: minDistance,
      maxdistance: maxDistance,
      sampleSize: sampleSize
    }
    //Limit by sample size
    this.tweetmarkerService.getTweetsInCircle(circleVal).subscribe(data => {
      if (data.success) {
        callback(data.output);
      } else {
        this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout:3000})
      }
    });
  }

  displayPoiInArray(tweetArray) {
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
    this.lastPoiArray = null;
    this.lastPoiWindowArray = null;
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

   //Slider 
   onSliderSampleChange(value) {
    this.sliderSampleSize = Math.round(value);
  }

  onSliderDisplayChange(value) {
    this.sliderSelectedSize = Math.round(value);
  }


}
