import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class PoimarkerService {
  poi:any;
  apiUrl: string;

  constructor(private http: Http) { 
    this.apiUrl = 'http://localhost:3001/';
  }


  getPoiInCircle(circleVal) {
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.post(this.apiUrl + 'users/getpoicircle' , circleVal, {headers: headers})
      .map(res => res.json());
  }

  getPoiInPolygon(polygonVal) {
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.post(this.apiUrl + 'users/getpoipolygon' , polygonVal, {headers: headers})
      .map(res => res.json());
  }

}
