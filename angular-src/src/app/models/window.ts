import { AlgorithmService } from '../services/algorithm.service';
import { TweetmarkerService } from '../services/tweetmarker.service';
import { GoogleMapsAPIWrapper } from '@agm/core/services/google-maps-api-wrapper';
import { window } from 'd3';

export class MapWindow {
    private google:any;

    private neLat;
    private neLng;
    private nwLat;
    private nwLng;
    private seLat;
    private seLng;
    private swLat;
    private swLng;
    private algorithmService:AlgorithmService;
    private tweetmarkerService:TweetmarkerService;

    constructor(tweetmarkerService:TweetmarkerService) {
        this.tweetmarkerService = tweetmarkerService;
    }

    getTweetsInWindow(sampleSize:number) {
        let windowParams = {
            neLat: this.neLat,
            neLng: this.neLng,
            nwLat: this.nwLat,
            nwLng: this.nwLng,
            seLat: this.seLat,
            seLng: this.seLng,
            swLat: this.swLat,
            swLng: this.swLng,
            sampleSize: sampleSize
          }
        return this.tweetmarkerService.getTweetsInPolygon(windowParams);
    }

    //returns a json object with mapbounds
    getMapBounds(gMap: GoogleMapsAPIWrapper) {
        let _self = this;
        let q =new Promise<any>((resolve, reject)=>{
            gMap.getBounds().then(data => {
                let windowInfo = data.toJSON();
                _self.neLat = windowInfo.north;
                _self.neLng = windowInfo.east;
                _self.nwLat = windowInfo.north
                _self.nwLng = windowInfo.west;
                _self.seLat = windowInfo.south;
                _self.seLng = windowInfo.east;
                _self.swLat = windowInfo.south;
                _self.swLng = windowInfo.west;
                resolve(_self);
            })
        });
        return q; 
    }

    //returns a google latlngbounds
    getLatLngBounds(gMap: GoogleMapsAPIWrapper) {
        let q =new Promise<any>((resolve, reject)=>{
            gMap.getBounds().then(data => {
                let windowInfo = data.toJSON();
                let neLatLng = new google.maps.LatLng({lat: windowInfo.north, lng: windowInfo.east});
                let swLatLng = new google.maps.LatLng({lat: windowInfo.south, lng: windowInfo.west});
                let bounds = new google.maps.LatLngBounds(swLatLng, neLatLng);
                resolve(bounds);
            })
        });
        return q;
    }
}
