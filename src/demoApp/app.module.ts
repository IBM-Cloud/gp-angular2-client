import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { GpTranslateModule } from '../../index';

import { AppComponent } from './app.component';
import { Feature1Component } from './feature1.component';

@NgModule({
  declarations: [
    AppComponent, Feature1Component
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    GpTranslateModule.forRoot({
      "gpCredentialsJson": "assets/credentials.json",
      "defaultBundle": "bundle1",
      "uselocal": false
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
