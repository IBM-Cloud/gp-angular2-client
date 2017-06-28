import { Pipe, PipeTransform } from '@angular/core';
import { GpTranslateService, LangChangeEvent } from './gp-translate.service';
import {Subscription} from 'rxjs/Subscription';

@Pipe({
    name: 'gptranslate',
    pure: false
})
export class GpTranslatePipe implements PipeTransform {
    private _cachedText: string;
    private _key: string;
    private _bundle: string;
    private _lang: string;
    private _changedLanguage: string;
    onLangChangeSub: Subscription;
    constructor (private gpTranslateService: GpTranslateService){
        if(!this.onLangChangeSub) {
            this.onLangChangeSub = this.gpTranslateService.onLangChange.subscribe((event: LangChangeEvent) => {
                this._changedLanguage = event.lang;
                this.getNewTranslation(this._key, this._bundle, this._changedLanguage);
            });
        }
    }

    transform(translationkey: string, langParam?: string, bundleParam?: string): string {
        if (!this._cachedText) {
            this._key = translationkey;
            this._bundle =  this.gpTranslateService.getConfig().defaultBundle;
            if (bundleParam) {
                this._bundle = bundleParam
            }
            if (langParam) {
                this._lang = langParam;
            }
            this._cachedText = translationkey;
            this.getNewTranslation(translationkey, this._bundle, this._lang);
        }
        return this._cachedText;
    }

    getNewTranslation(key, bundle, lang) {
      let origlang = this._lang;
      if (this._changedLanguage) {
          this._lang = this._changedLanguage;
      }
      if (origlang) {
          this._lang = origlang;
      }
      this.gpTranslateService.getTranslation(key, bundle, this._lang).then((data) => {
          if (key in data) {
              this._cachedText = data[key];
          }
      });
    }
}
