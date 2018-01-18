import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AgmCoreModule, GoogleMapsAPIWrapper, AgmDataLayer, AgmInfoWindow, CircleManager, AgmCircle } from '@agm/core';
import { FlashMessagesModule } from 'angular2-flash-messages';

//Page Components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import {D3SliderDirective} from 'ng-d3-slider/d3-slider.directive'

//Services
import { TweethandlerService } from './services/tweethandler.service';
import { TweetmarkerService } from './services/tweetmarker.service';
import { CorrelationService } from './services/correlation.service';
import { MapComponent } from './components/map/map.component';
import { MapgreedyComponent } from './components/mapgreedy/mapgreedy.component';
import { NavbarComponent } from './components/navbar/navbar.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'random', component: MapComponent},
  { path: 'greedy', component: MapgreedyComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MapComponent,
    MapgreedyComponent,
    NavbarComponent,
    D3SliderDirective,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes),
    HttpModule,
    FormsModule,
    FlashMessagesModule,
    AgmCoreModule.forRoot( {
      apiKey: 'AIzaSyC0fDVH5KjNjVGXgHPKT7Z7icWjMCaESuo'
    }),
  ],
  providers: [ TweethandlerService, TweetmarkerService, CorrelationService, GoogleMapsAPIWrapper, CircleManager, AgmCircle], //
  bootstrap: [AppComponent]
})
export class AppModule { }
