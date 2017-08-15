import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { HttpModule } from '@angular/http';

import { GpTranslateDirective } from './src/core/gp-translate.directive';
import { GpTranslatePipe } from './src/core/gp-translate.pipe';

import { GpTranslateService } from './src/core/gp-translate.service';
import { GpConfig } from './src/core/gpconfig';

export { GpTranslateService } from './src/core/gp-translate.service';

export function ConfigLoader(gpTranslateService: GpTranslateService,
                            configObj: any) {
  const config: GpConfig = new GpConfig();
  if (!configObj.defaultLang) {
    configObj.defaultLang = gpTranslateService.getBrowserLang();
  }
  config.defaultLang = configObj.defaultLang;
  config.defaultBundle = configObj.defaultBundle;
  config.uselocal = configObj.uselocal;
  config.localfallbackLang = configObj.localfallbackLang;
  gpTranslateService.config = config;
  // during app bootstrapping we load the credentials, and then the translations from the default bundle and language specified
  return () => gpTranslateService.loadCredentials(configObj.gpCredentialsJson).
        then(() => gpTranslateService.loadtranslations(configObj.defaultBundle, configObj.defaultLang));
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
  providers: [],
  exports: [GpTranslateDirective, GpTranslatePipe]
})

export class GpTranslateModule {

  static forRoot(configObj: any): ModuleWithProviders {
    return {
      ngModule: GpTranslateModule,
      providers: [GpTranslateService,
        { provide: configObj, useValue: configObj, multi: false},
        { provide: APP_INITIALIZER, useFactory: ConfigLoader,
          deps: [GpTranslateService, configObj], multi: true },
      ]
    };
  }
}
