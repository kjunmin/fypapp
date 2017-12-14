import { Component, OnInit, NgModule, ViewChild, AfterViewInit } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { TweetmarkerService } from '../../services/tweetmarker.service';
import { CorrelationService } from '../../services/correlation.service';
import { AgmCoreModule, GoogleMapsAPIWrapper, AgmInfoWindow, AgmDataLayer, CircleManager, AgmCircle } from '@agm/core';

declare var google:any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private map:any;

  @ViewChild(GoogleMapsAPIWrapper) private gmapWrapper: GoogleMapsAPIWrapper;
  tweetArray: Object[];
  myLat: number;
  myLng: number;
  myLabel: string;
  screennameInput: string;
  countryInput: string;
  lastClickedCircle: any;

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
  }


  ngOnInit() {
    this.gmapWrapper.panTo({lat: this.myLat, lng:this.myLng});
  }

  getTweetData(res) {
    let lat = res.coords.lat;
    let lng = res.coords.lng;
    const position = new google.maps.LatLng(lat, lng);
    // this.centerMap(position);
    let searchRadius = 2000;
    this.drawCircle(position, searchRadius);
    this.getTweetsInCircle(lat, lng, 0, searchRadius);
  }

  //Pan to latlng position on map
  centerMap(position) {
    this.gmapWrapper.panTo(position);
  }

  //Draw circle of radius x at latlng position
  drawCircle(position, radius) {
    if (this.lastClickedCircle) {
      console.log(this.lastClickedCircle);
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

  getTweetsInCircle(lat, lng, minDistance, maxDistance) {
    let tweetArray = [];
    let circleVal = {
      lat: lat,
      lng: lng,
      mindistance: minDistance,
      maxdistance: maxDistance
    }
    this.tweetmarkerService.getTweetsInCircle(circleVal).subscribe(data => {
      if (data.success) {
        for (let i = 0; i < data.output.length; i++) {
          tweetArray.push(data.output[i]);
        }
      } else {
        this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout:3000})
      }
    });
    this.tweetArray = tweetArray;
  }

  getTweetsByUser(screenname) {
    let tweetArray = [];
    const reqBody = {screenname: screenname};
    this.tweetmarkerService.getTweetsByUser(reqBody).subscribe(data => {
      if (data.success) {
        for (let i = 0; i < data.output.length; i++) {
          tweetArray.push(data.output[i]);
        }
        this.flashMessagesService.show(String(data.output.length) + " tweets found!", {cssClass: 'alert-success', timeout: 3000});
      } else {
        this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout: 3000});
      }
    })
    this.tweetArray = tweetArray;
  }

  getTweetsByCountry(country) {
    let tweetArray = [];
    const reqBody = {country: country};
    this.tweetmarkerService.getTweetsByCountry(reqBody).subscribe(data => {
      if (data.success) {
        for (let i = 0; i < data.output.length; i++) {
          tweetArray.push(data.output[i]);
        }
        this.flashMessagesService.show(String(data.output.length) + " tweets found!", {cssClass: 'alert-success', timeout: 3000});
      } else {
        this.flashMessagesService.show(data.output, {cssClass: 'alert-danger', timeout: 3000});
      }
    })
    this.tweetArray = tweetArray;
  }

  getMarkerData(res) {
    console.log(res);
    let lat = res.Latitude;
    let lng = res.Longitude;
    let tag = res.Tags;
    let tid = res.TweetId;
    let tArray: any[] = this.tweetArray;
    for (var i = 0; i < tArray.length; i++) {
      if (tid != tArray[i].TweetId) {
        var sim = this.correlationService.calculateCosineSimilarty(tag, tArray[i].Tags);
        tArray[i].Label = sim.toString();
        tArray[i].Similarity = sim;
      }
    }
    this.tweetArray = tArray;
  }

  calculateCosSim() {
    var sim = this.correlationService.calculateCosineSimilarty("one,the,blessings,old,friends,that,you,can,afford,stupid,with,them,failed,trip", "don't,recall,jiwei,jiwei,jiwei,being,what,the,teacher,wanted,hear")
    console.log(sim);
  }

  substrCount() {
    var str1 = ["test", "one", "two", "test"];
    var master = ["one", "two", "test"];
    let a = this.correlationService.constructVector(str1, master);
    console.log(a);
  }

}
