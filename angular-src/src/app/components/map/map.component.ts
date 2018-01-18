import { Component, OnInit, NgModule, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { TweetmarkerService } from '../../services/tweetmarker.service';
import { CorrelationService } from '../../services/correlation.service';
import { AgmCoreModule, GoogleMapsAPIWrapper, AgmInfoWindow, AgmDataLayer, CircleManager, AgmCircle } from '@agm/core';

declare var google:any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  private map:any;

  @ViewChild(GoogleMapsAPIWrapper) private gmapWrapper: GoogleMapsAPIWrapper;
  tweetArray: Object[];
  lastTweetArray: Object[];
  lastTweetWindowArray: Object[];
  tableDisplay: Object[];
  myLat: number;
  myLng: number;
  myLabel: string;
  lastClickedCircle: any;
  sliderSampleSize: number;
  sliderSelectedSize: number;
  sliderExternalSize: number;
  sliderAlphaValue: number;
  isMapLoadEnabled: any;

  constructor(
    private cd: ChangeDetectorRef,
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
    this.sliderSelectedSize = 200;
    this.sliderExternalSize = 100;
    this.sliderAlphaValue = 0.50;
    this.isMapLoadEnabled = false;
  }


  ngOnInit() {
    this.gmapWrapper.panTo({lat: this.myLat, lng:this.myLng});
  }

  dropMarkerWithAnimation(markerArray) {
    console.log("Displaying markers");
    for (var i = 0; i < markerArray.length; i++) {
      console.log(markerArray[i].getVisible());
      markerArray[i].setVisible(true);
    }
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
        _self.compareSimWithMarker(object);           //Execute similarity calculation
      } 
      marker.info.open(this.gmapWrapper, marker);                 //And open the info window for the marker
    });
    return marker;
  }

  //Get focused tweet data (CIRCLE)
  getTweetDataOnMapClick(res) {
    let lat = res.coords.lat;
    let lng = res.coords.lng;
    const position = new google.maps.LatLng(lat, lng);
    // this.centerMap(position);
    let searchRadius = 2000;
    this.drawCircle(position, searchRadius);
    this.deleteMarkersFromMap(this.lastTweetArray);
    this.getTweetsInCircle(lat, lng, 0, searchRadius);
  }

  //gets window tweet data (POLYGON)
  getTweetDataOnBoundsChange() {
    this.deleteMarkersFromMap(this.lastTweetWindowArray);
    if (this.isMapLoadEnabled) {
      this.getMapBounds(res => {
        this.lastTweetWindowArray = this.getTweetsInPolygon(res.northEastBounds.lat, res.northEastBounds.lng, res.northWestBounds.lat, res.northWestBounds.lng, res.southEastBounds.lat, res.southEastBounds.lng, res.southWestbounds.lat, res.southWestbounds.lng);
      }); 
    }
  }

  //Delete tweet markers from map
  deleteMarkersFromMap(mArray) {
    console.log("Deleting Markers");
    if (mArray == null || mArray == undefined) {
      return;
    } else {
      mArray.forEach(element => {
        element.setMap(null);
        mArray = null;
      });
    }
  }

  //Get tweets in an area
  getTweetsInCircle(lat, lng, minDistance, maxDistance) {
    let sampleSize = this.sliderSampleSize;
    let tweetArray = [];
    let tweetArray2 = [];
    let circleVal = {
      lat: lat,
      lng: lng,
      mindistance: minDistance,
      maxdistance: maxDistance,
      sampleSize: sampleSize
    }
    this.tweetmarkerService.getTweetsInCircle(circleVal).subscribe(data => {
      let _self = this;
      if (data.success) {
        //Limit by displayed tweets
        let arrSize = ( data.output.length > this.sliderSelectedSize ? this.sliderSelectedSize: data.output.length);
        for (let i = 0; i < arrSize; i++) {
          tweetArray2.push(data.output[i]);
          let marker = this.createMarker(data.output[i]);
          this.gmapWrapper.createMarker(marker).then(res => {
            tweetArray.push(res);
          })
        }
      } else {
        this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout:3000})
      }
    });
    this.tweetArray = tweetArray2;
    this.lastTweetArray = tweetArray;
  }

  getTweetsInPolygon(lat1, lng1, lat2, lng2, lat3, lng3, lat4, lng4){
    let sampleSize = this.sliderExternalSize;
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
        let arrSize = ( data.output.length > this.sliderExternalSize ? this.sliderExternalSize: data.output.length);
        for (let i = 0; i < arrSize; i++) {
          let marker = this.createMarker(data.output[i]);
          this.gmapWrapper.createMarker(marker).then(res => {
            this.lastTweetWindowArray.push(res);
            tweetArray.push(res);
          })
        }
      } else {
        this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout:3000})
      }
    });
    return tweetArray;
  }

  //Get similarity between selected tweet and others in area
  compareSimWithMarker(res) {
    this.tableDisplay = undefined;
    let tArray: any[] = this.tweetArray;
    let alpha = this.sliderAlphaValue;
    console.log(res.Tags);
    var rArray = this.correlationService.calculateSimilarity(res, tArray, alpha);
    this.tableDisplay = rArray;
  }

  //Slider 
  onSliderSampleChange(value) {
    this.sliderSampleSize = Math.round(value);
  }

  onSliderMapChange(value) {
    this.sliderExternalSize = Math.round(value);
  }

  onSliderDisplayChange(value) {
    this.sliderSelectedSize = Math.round(value);
  }

  onSliderAlphaChange(value) {
    this.sliderAlphaValue = value;
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

  test() {
  }
}


