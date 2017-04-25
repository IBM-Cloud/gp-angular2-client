import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ModuleWithProviders, APP_INITIALIZER, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { GpTranslateDirective } from './gp-translate.directive';
import { GpTranslatePipe } from './gp-translate.pipe';

import { GpTranslateService } from './gp-translate.service';
import { GpConfig } from './gpconfig';

export function ConfigLoader(gpTranslateService: GpTranslateService,
                            configObj:any) {
  let config: GpConfig = new GpConfig();
  if (!configObj.defaultLang) {
    configObj.defaultLang = gpTranslateService.getBrowserLang();
  }
  config.defaultLang = configObj.defaultLang;
  config.defaultBundle = configObj.defaultBundle;
  config.uselocal = configObj.uselocal;
  gpTranslateService.config = config;
  // during app bootstrapping we load the credentials, and then the translations from the default bundle and language specified
  return () => gpTranslateService.loadCredentials(configObj.gpCredentialsJson).
        then(() => gpTranslateService.getTranslationFromGP(configObj.defaultBundle, configObj.defaultLang));
        // without `() =>` appinits[i] error occurs
}

@NgModule({
  declarations: [
    GpTranslateDirective,
    GpTranslatePipe
  ],
  imports: [
    HttpModule
  ],
  providers:[],
  exports:[GpTranslateDirective, GpTranslatePipe]
})

export class GpTranslateModule {

  static forRoot(configObj: any): ModuleWithProviders {
    return {
      ngModule: GpTranslateModule,
      providers: [GpTranslateService,
        { provide: configObj, useValue: configObj, multi: false},
        { provide: APP_INITIALIZER, useFactory: ConfigLoader,
          deps:[GpTranslateService, configObj], multi: true },
      ]
    }
  }
}
