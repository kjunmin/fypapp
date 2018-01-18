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
  tweetArray: Object[];
  lastTweetArray: Object[];
  lastTweetWindowArray: Object[];
  myLat: number;
  myLng: number;
  myLabel: string;
  lastClickedCircle: any;
  sliderSampleSize: number;
  sliderSelectedSize: number;
  sliderExternalSize: number;

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
    this.sliderSelectedSize = 200;
    this.sliderExternalSize = 100;
  }


  ngOnInit() {
    this.gmapWrapper.panTo({lat: this.myLat, lng:this.myLng});
  }

  selectGreedy() {
    //Sort the array in increasing Similarity to form a max heap
    function sortHeap(heap) {
      return heap.sort((a,b) => {
        return parseFloat(a.similarity) - parseFloat(b.similarity);
      })
    }

    let k = 50;
    let O = this.tweetArray;
    let S = null;
    let H = [];
    O.forEach(element => {
      let tuple = {
        tweet: element,
        similarity: this.correlationService.getSimilaritySum(element, O, 0.5),
        iteration: 0
      }
      H.push(tuple);
    });
    let sortedHeap = sortHeap(H);
    console.log(sortHeap(H));
    console.log(sortedHeap.pop());
    // while(S.length < k && H.length != 0) {
    //   let t = H.pop();
    //   let cnt = 0;
    //   while (cnt != S.length) {
        
    //   }
    // }

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
        _self.compareSimWithMarker(object);     
      }
                            //Execute similarity calculation
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

 
  //Get similarity between selected tweet and others in area
  compareSimWithMarker(res) {
    let tArray: any[] = this.tweetArray;
    var rArray = this.correlationService.calculateSimilarity(res, tArray, 0.5)
    this.tweetArray = rArray;
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
    function sortHeap(heap) {
      return heap.sort((a,b) => {
        return parseFloat(a) - parseFloat(b);
      })
    }
    var newArray = [1, 4, 3, 2, 1];
    console.log(sortHeap(newArray));
  }
}
