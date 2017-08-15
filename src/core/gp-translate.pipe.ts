import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { GpTranslateService, LangChangeEvent } from './gp-translate.service';
import {Subscription} from 'rxjs/Subscription';

@Pipe({
    name: 'gptranslate',
    pure: false
})
export class GpTranslatePipe implements PipeTransform, OnDestroy {
    private _cachedText: string;
    private _key: string;
    private _bundle: string;
    private _lang: string;
    private _changedLanguage: string;
    private _params: string;
    onLangChangeSub: Subscription;
    constructor (private gpTranslateService: GpTranslateService) {
    }

    transform(translationkey: string, bundleParam?: string, langParam?: string, params?: string): string {
        if (!this._cachedText) {
            this._key = translationkey;
            this._bundle =  this.gpTranslateService.getConfig().defaultBundle;
            if (bundleParam) {
                this._bundle = bundleParam;
            }
            if (langParam) {
                this._lang = langParam;
            }
            this._cachedText = translationkey;
            this._params = params;
            this.getNewTranslation(translationkey, this._bundle, this._lang);
            this._dispose();
            if (!this.onLangChangeSub) {
                this.onLangChangeSub = this.gpTranslateService.onLangChange.subscribe((event: LangChangeEvent) => {
                    this._changedLanguage = event.lang;
                    this.getNewTranslation(this._key, this._bundle, this._changedLanguage);
                });
            }
        }
        return this._cachedText;
    }

    // method to replace placeholders with input params
    // for example if text is 'show the {tempParam}' and params is {'tempParam':'file'}
    //     then the text changes to 'show the file'
    interpolatedText(originaltext: string, params: string): Promise<any> {
      const promises = [];
      const paramMap: {} = JSON.parse(params);
      for (const key in paramMap) {
          if (paramMap[key]) {
              const keyText = paramMap[key];
              promises.push([key, keyText]);
          }
      }
      return Promise.all(promises)
        .then((results) => {
            for (const k in results) {
                if (results[k]) {
                    const replaceStr = '{' + results[k][0] + '}';
                    if (originaltext) {
                        originaltext = originaltext.replace(replaceStr, results[k][1]);
                    }
                }
            }
            return originaltext;
          },
          (error) =>  {
            console.log('Error occurred');
          }
      )
      .catch( (e) => {
          console.log('Failed to interpolate text', e);
      });
    }

    getNewTranslation(key, bundle, lang) {
      // not changing translations for entities where language has been explicitly provided
      if (this._lang) {
          lang = this._lang;
      }
      this.gpTranslateService.getResourceStrings(bundle, lang).then((data) => {
          if (key in data) {
              this._cachedText = data[key];
              if (this._params) {
                  this.interpolatedText(this._cachedText, this._params).then((text) => {
                      this._cachedText = text;
                  });
              }
          }
      });
    }

    _dispose(): void {
       if (this.onLangChangeSub) {
           this.onLangChangeSub.unsubscribe();
           this.onLangChangeSub = undefined;
       }
    }

    ngOnDestroy(): void {
        this._dispose();
    }
}
