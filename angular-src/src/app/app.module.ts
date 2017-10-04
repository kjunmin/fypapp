import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AgmCoreModule, GoogleMapsAPIWrapper, AgmDataLayer, AgmInfoWindow } from '@agm/core';
import { FlashMessagesModule } from 'angular2-flash-messages';


//Page Components
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';

//Services
import { TweetmarkerService } from './services/tweetmarker.service';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
]

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
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
  providers: [TweetmarkerService, GoogleMapsAPIWrapper],
  bootstrap: [AppComponent]
})
export class AppModule { }
