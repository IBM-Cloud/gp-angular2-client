import { Pipe, PipeTransform } from '@angular/core';
import { GpTranslateService } from './gp-translate.service';

@Pipe({
  name: 'gptranslate',
  pure: false
})
export class GpTranslatePipe implements PipeTransform {
  private _cachedText: string;
  constructor (private gpTranslateService: GpTranslateService){}

  transform(translationkey: string, langParam?: string, bundleParam?: string): string {
    if (!this._cachedText) {
      let bundle =  this.gpTranslateService.getConfig().defaultBundle;
      if (bundleParam)
          bundle = bundleParam
      let lang = this.gpTranslateService.getConfig().defaultLang;
      if (langParam)
          lang = langParam;
      this._cachedText = translationkey;
      this.gpTranslateService.getTranslation(translationkey, bundle, lang).then((data) => {
        if (translationkey in data)
          this._cachedText = data[translationkey];
      })
    }
    return this._cachedText;
  }
}
