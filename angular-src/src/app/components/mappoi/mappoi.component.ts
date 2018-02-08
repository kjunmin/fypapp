import { Component, OnInit, NgModule, ViewChild, AfterViewInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { PoimarkerService } from '../../services/poimarker.service';
import { CorrelationService } from '../../services/correlation.service';
import { AlgorithmService } from '../../services/algorithm.service';
import { AgmCoreModule, GoogleMapsAPIWrapper, AgmInfoWindow, AgmDataLayer, CircleManager, AgmCircle } from '@agm/core';
import { Observable } from 'rxjs/Observable';

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
  sliderSampleSize: number;
  sliderDisplayNum: number;
  timeout: any;
  searchInput: string;

  constructor(
    private agmCircle: AgmCircle,
    private circleManager: CircleManager,
    private poimarkerService: PoimarkerService, 
    private correlationService: CorrelationService,
    private flashMessagesService: FlashMessagesService,
    private algorithmService: AlgorithmService
  ) { 
    this.myLabel = "YOU ARE HERE";
    this.myLat = 1.3553794;
    this.myLng = 103.86774439999999;
    this.lastClickedCircle = null;
    this.sliderSampleSize = 200;
    this.sliderDisplayNum = 10;
    this.timeout = 0;
  }

  test() {
    console.log("test");
  }

  ngOnInit() { 
    this.gmapWrapper.panTo({lat: this.myLat, lng:this.myLng});
  }

  submitSearchQuery() {
    this.deleteMarkersFromMap(this.lastPoiWindowArray);
    this.getMapBounds(res => {
      this.getPoiPolygonSearch(res.northEastBounds.lat, res.northEastBounds.lng, 
        res.northWestBounds.lat, res.northWestBounds.lng,
        res.southEastBounds.lat, res.southEastBounds.lng, 
        res.southWestbounds.lat, res.southWestbounds.lng, data => {
          // var k = this.algorithmService.selectGreedy(data, 0.5, 25);
          this.lastPoiWindowArray = this.displayPoiInArray(data);
      });
    }); 
  }

  mapSettle() {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.getPoiDataOnBoundsChange();
     } , 3000); //Get tweet data once map has been in idle state for 2 seconds
  }

  //gets window tweet data (POLYGON)
  getPoiDataOnBoundsChange() {
    this.deleteMarkersFromMap(this.lastPoiWindowArray);
    this.getMapBounds(res => {
      this.getPoiInPolygon(res.northEastBounds.lat, res.northEastBounds.lng, 
        res.northWestBounds.lat, res.northWestBounds.lng,
        res.southEastBounds.lat, res.southEastBounds.lng, 
        res.southWestbounds.lat, res.southWestbounds.lng, data => {
          // var k = this.algorithmService.selectGreedy(data, 0.5, 25);
          this.lastPoiWindowArray = this.displayPoiInArray(data);
      });
    }); 
  }

  getPoiPolygonSearch(lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, callback){
    let sampleSize = this.sliderSampleSize;
    let searchInput = this.searchInput;
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
      searchInput: searchInput,
      sampleSize: sampleSize
    }
    this.poimarkerService.getPoiWithSearch(polygonVal).subscribe(data => {
      if (data.success) {
        console.log(data.output);
        let arrSize = ( data.output.length > this.sliderSampleSize ? this.sliderSampleSize: data.output.length);
        callback(data.output);
      } else {
        this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout:3000})
      }
    });
  }

  getPoiInPolygon(lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4, callback){
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
    this.poimarkerService.getPoiInPolygon(polygonVal).subscribe(data => {
      if (data.success) {
        console.log(data.output);
        let arrSize = ( data.output.length > this.sliderSampleSize ? this.sliderSampleSize: data.output.length);
        callback(data.output);
      } else {
        this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout:3000})
      }
    });
  }

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
        // _self.compareSimWithMarker(object);     //Execute similarity calculation
      }             
      marker.info.open(this.gmapWrapper, marker);                 //And open the info window for the marker
    });
    return marker;
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

  createInfoWindow(marker, position) {
    var info = new google.maps.InfoWindow({
      content: "<div class='tweet-window-container'> \
                  <ul class='list-group'> \
                      <li class='list-group-item'><h5>Name:</h5> " +  marker.PlaceName + "</li> \
                      <li class='list-group-item'><h5>Category:</h5> " + marker.Category + "</li> \
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

  //Slider 
  onSliderSampleChange(value) {
    this.sliderSampleSize = Math.round(value);
  }

  onSliderDisplayChange(value) {
    this.sliderDisplayNum = Math.round(value);
  }


}
