import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class TweetmarkerService {
  tweet: any;
  apiUrl: string;

  constructor(private http: Http) { 
    this.apiUrl = 'http://localhost:3001/';
  }

  getTweetsByUser(screenname) {
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.post(this.apiUrl + 'users/gettweets' , screenname, {headers: headers})
      .map(res => res.json());
  }

  getTweetsByCountry(country) {
    let headers = new Headers();
    headers.append('Content-type', 'application/json');
    return this.http.post(this.apiUrl + 'users/gettweetsc' , country, {headers: headers})
      .map(res => res.json());
  }

}
