import { Injectable } from '@angular/core';
import { TweetmarkerService } from '../services/tweetmarker.service';
import { CorrelationService } from '../services/correlation.service';

declare var google:any;

@Injectable()
export class TweethandlerService {

  constructor(
    private tweetmarkerService: TweetmarkerService, 
    private correlationService: CorrelationService,
  ) {
    
   }

   //Get focused tweet data (CIRCLE)
  getTweetDataOnMapClick(res, lastTweetArray, lastClickedCircle, mMap) {
    let lat = res.coords.lat;
    let lng = res.coords.lng;
    const position = new google.maps.LatLng(lat, lng);
    // this.centerMap(position);
    let searchRadius = 2000;
    this.drawCircle(position, searchRadius, lastClickedCircle, mMap);
    this.deleteMarkersFromMap(lastTweetArray);
  }

  createMarker(object) {
    var mLatLng = new google.maps.LatLng(object.Latitude, object.Longitude);
  
    var marker = new google.maps.Marker({
        position: mLatLng,
    });
    marker.setAnimation(google.maps.Animation.DROP);
    marker.info = this.createInfoWindow(object, mLatLng);
    google.maps.event.addListener(marker, 'click', function() {   //On clicking a marker
      if (this.tweetArray !== null) {
        this.compareSimWithMarker(object);     
      }
                            //Execute similarity calculation
      marker.info.open(this.gmapWrapper, marker);                 //And open the info window for the marker
    });
    return marker;
  }

  //Pan to latlng position on map
  centerMap(position, mMap) {
    mMap.panTo(position);
  }

  //Draw circle of radius x at latlng position
  drawCircle(position, radius, lastClickedCircle, mMap) {
    if (lastClickedCircle) {
      lastClickedCircle.setMap(null);
      lastClickedCircle = null;
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
    mMap.createCircle(circleOptions).then(res => {
      // Get circle promise from createCircle API method call and store reference as last circle
      lastClickedCircle = res;
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

  //Get similarity between selected tweet and others in area
  compareSimWithMarker(res, tweetArray, callback) {
    let tArray: any[] = tweetArray;
    var rArray = this.correlationService.calculateSimilarity(res, tArray, 0.5)
    callback(rArray);
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

}

