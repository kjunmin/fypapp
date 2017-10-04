import { Component, OnInit, NgModule } from '@angular/core';
import { FlashMessagesService } from 'angular2-flash-messages';
import { TweetmarkerService } from '../../services/tweetmarker.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  tweetArray: Object[];
  myLat: number;
  myLng: number;
  myLabel: string;
  screennameInput: string;
  countryInput: string;

  constructor(
    private tweetmarkerService: TweetmarkerService, 
    private flashMessagesService: FlashMessagesService 
  ) { 
    this.myLabel = "YOU ARE HERE";
    this.myLat = 1.3553794;
    this.myLng = 103.86774439999999;
  }

  ngOnInit() {
    
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


  displayTweetArray() {
    console.log(this.tweetArray[0]);
    console.log(this.tweetArray[1]);
  }
}
