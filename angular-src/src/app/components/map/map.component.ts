import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

declare var google:any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  @ViewChild('map') private googleMap: ElementRef;
  geolocationPosition: any;
  map: any;

  constructor() { 
  }

  ngOnInit() {
    let gMap = <HTMLElement> document.querySelector("#map");
    let infoWindow = new google.maps.InfoWindow;
    let lastCircle = null;
    let mapOptions = {
          zoom: 4,
          center: {lat: -33, lng: 151},
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
            mapTypeIds: ['roadmap', 'terrain']
          }
    }
    var map = new google.maps.Map(gMap, mapOptions);
    this.map = map;

    google.maps.event.addListener(this.map, 'click', (event) => {
      var pos = event.latLng;
      placeMarkerAndPanTo(map, pos);
    })
  
    
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position=> {
          var pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          map.panTo(pos);
          map.setZoom(14);
        },
        error=> {
          switch(error.code) {
            case 1: 
              console.log('Permission Denined');
              break;
            case 2:
              console.log('Position Unavailable');
              break;
            case 3:
            console.log('Timeout');
            break;
          }
        }
      ) 
    }

    function drawCircle(latlng) {
      var circleOptions = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
            map: map,
            center: latlng,
            radius: 1000
      };
      if (lastCircle) {
        lastCircle.setMap(null);
      }
      lastCircle = new google.maps.Circle(circleOptions);
      console.log(lastCircle);
    }

    function placeMarkerAndPanTo(map, latlng) {
      map.panTo(latlng);
      drawCircle(latlng);
    }

    function getTweetsInCircle() {

    }
  }

}


