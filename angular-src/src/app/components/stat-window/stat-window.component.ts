import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-stat-window',
  templateUrl: './stat-window.component.html',
  styleUrls: ['./stat-window.component.css']
})
export class StatWindowComponent implements OnInit {

  observableData: Object[];

  constructor() {
    
  }

  @Input() tweetData: Observable<any>;

  ngOnInit() {
    this.tweetData.subscribe(v => {
      this.observableData = v;
    })
  }

}
