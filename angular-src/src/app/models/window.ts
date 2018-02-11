import { AlgorithmService } from '../services/algorithm.service';
import { TweetmarkerService } from '../services/tweetmarker.service';

export class MapWindow {
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

    constructor(tweetmarkerService:TweetmarkerService, neLat, neLng, nwLat, nwLng, seLat, seLng, swLat, swLng) {
        this.nwLat = nwLat;
        this.nwLng = nwLng;
        this.neLat = neLat;
        this.neLng = neLng;
        this.seLat = seLat;
        this.seLng = seLng;
        this.swLat = swLat;
        this.swLng = swLng;
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

}
