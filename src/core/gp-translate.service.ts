import { Injectable, Input, Inject, EventEmitter } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { GpConfig } from './gpconfig';
import 'rxjs/add/operator/map';

export interface LangChangeEvent {
    lang: string;
}

// class to store Bundle information and translations belonging to the bundle
export class BundleData {
    bundleName: string;
    sourceLanguage: string;
    targetLanguages: string[];
    // map of language to translation key/value pairs
    translations: Map<string, {}> = new Map<string, {}>();

    getFallbackLanguages(): string[] {
        let fallback: string[];
        fallback = [];
        fallback.push(this.sourceLanguage);
        for (const index in this.targetLanguages) {
            if (this.targetLanguages[index]) {
                fallback.push(this.targetLanguages[index]);
            }
        }
        return fallback;
    }

    getLangTranslations(lang: string) {
        return this.translations.get(lang);
    }
}

// implementing cache to store bundle translations to avoid unnecessary remote calls
export class Cache {
    // Map of bundleName to bundleData
    dataCacheMap: Map<string, BundleData> = new Map<string, BundleData>();

    getBundleInfo(bundleName: string): BundleData {
        return this.dataCacheMap.get(bundleName);
    }

    putBundleInfo(bundleName: string, info: {}) {
        let bundleData: BundleData;
        bundleData = this.dataCacheMap.get(bundleName);
        if (!bundleData) {
            bundleData = new BundleData();
            this.dataCacheMap.set(bundleName, bundleData);
        }
        bundleData.bundleName = bundleName;
        bundleData.sourceLanguage = info['sourceLanguage'];
        bundleData.targetLanguages = info['targetLanguages'];
    }

    putTranslations(bundleName: string, lang: string, incomingTranslations: {}) {
        let bundleData: BundleData;
        bundleData = this.dataCacheMap.get(bundleName);
        if (!bundleData) {
            bundleData = new BundleData();
            this.dataCacheMap.set(bundleName, bundleData);
        }
        bundleData.translations.set(lang, incomingTranslations);
    }
}


@Injectable()
export class GpTranslateService {
    private _requestOptions: RequestOptions;
    private _config: GpConfig;
    private _cache: Cache = new Cache();
    private _onLangChange: EventEmitter<LangChangeEvent> = new EventEmitter<LangChangeEvent>();

    constructor(@Inject(Http) private http: Http) {}

    @Input() set config(config: GpConfig) {
         this._config = config;
     }

     public getConfig(): GpConfig {
       return this._config;
     }

     /**
      * An EventEmitter to listen to lang change events
      * @type {EventEmitter<LangChangeEvent>}
      */
     get onLangChange(): EventEmitter<LangChangeEvent> {
         return this._onLangChange;
     }

    /**
      Setting up headers (basic authentication) for globalization pipeline instance
    **/
    get basicHeaders(): RequestOptions {
        if (this._requestOptions) {
           return this._requestOptions;
        }
        const username: string = this._config.creds.userId;
        const password: string = this._config.creds.password;
        const headers: Headers = new Headers();
        headers.append('Authorization', 'Basic ' + btoa(username + ':' + password));
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        return new RequestOptions({ headers: headers });
    }

    loadCredentials(url: string): Promise<{}> {
        return new Promise((resolve) => {
          this.http.get(url).map(res => res.json())
          .subscribe(
            creds => {
                    this._config.creds = creds;
                    resolve(creds);
            },
            error => {
                  this.handleError('Failed to load credentials');
            });
        });
    }

    getTranslation(key: string, values?: any, bundleParam?: string, langParam?: string): Promise<{}> {
        return this.getResourceStrings(bundleParam, langParam).then((resourceMap) => {
            if (resourceMap && resourceMap[key]) {
                return this.interpolatedText(resourceMap[key], values);
            } else {
              return key;
            }
        });
    }

    interpolatedText(originaltext: string, values: any): string {
        if (!values) {
            return originaltext;
        }
        let returnText = originaltext;
        for (const key in values) {
            if (values.hasOwnProperty(key)) {
                const keyValue = values[key];
                const replaceStr = '{' + key + '}';
                if (returnText) {
                    returnText = returnText.replace(replaceStr, keyValue);
                }
            }
        }
        return returnText;
    }

    getResourceStrings(bundleParam?: string, langParam?: string): Promise<{}> {
        let bundle = this._config.defaultBundle;
        let  lang;
        if (bundleParam) {
            bundle = bundleParam;
        }
        const cacheBundleData = this._cache.getBundleInfo(bundle);
        if (cacheBundleData) {
            lang = this.fallback(bundle, langParam);
            const resourceLangMap = cacheBundleData.getLangTranslations(lang);
            if (resourceLangMap) {
                return Promise.resolve(resourceLangMap);
            }
            console.log('loading from cache', bundle, lang);
        }
        return this.loadtranslations(bundle, langParam);
    }

    // loading translations from local file
    getLocalTranslations(bundle: string, lang: string): Promise<{}> {
        let localpath = this._config.localpath;
        if (!localpath) {
            localpath = '/assets/i18n';
        }
        lang = this.fallback(bundle, lang);
        return new Promise((resolve) => {
            this.http.get(localpath + '/' + bundle + '/' + lang + '.json')
            .subscribe(
              data => {
                  this.updateCache(bundle, lang, data.json());
                  resolve(data.json());
                    },
              error => {
                  this.handleError('Failed to load translations from local path');
              }
            );
        });
    }

    loadtranslations(bundle: string, lang: string): Promise<{}> {
        lang = this.fallback(bundle, lang);
        if (true === this._config.uselocal) {
            return this.getBundleInfo(bundle).then(() => {
              return this.getLocalTranslations(bundle, lang);
            });
        }
        const baseurl = this._config.creds.url;
        const instanceId = this._config.creds.instanceId;
        const bundleUrl = baseurl + '/' +  instanceId + '/v2/bundles/' + bundle + '/' + lang;
        console.log('loading from GP instance', bundle, lang);
        return this.getBundleInfo(bundle).then(() => {
            return new Promise((resolve) => {
                this.http.get(bundleUrl, this.basicHeaders)
                .map(res => res.json())
                .subscribe(
                    data => {
                        const resourceMap = data.resourceStrings;
                        this.updateCache(bundle, lang, resourceMap);
                        resolve(resourceMap);
                    },
                    error => {
                        const bundleData = this._cache.getBundleInfo(bundle);
                        if (bundleData) {
                            lang = this.fallback(bundle, lang);
                            const resourceMap = bundleData.getLangTranslations(lang);
                            if (resourceMap != null) {
                                resolve(resourceMap);
                            } else {
                                this.handleError('Failed to load translations using globalization pipeline instance and fallback language');
                            }
                        } else {
                          this.handleError('Failed to load translations from globalization pipeline instance');
                       }
                  });
              });
         });
    }

    private updateCache(bundle: string, lang: string, resourceMap: {}): void {
        let bundleData = this._cache.getBundleInfo(bundle);
        if (!bundleData) {
            bundleData = new BundleData();
            this._cache.dataCacheMap.set(bundle, bundleData);
        }
        bundleData.translations.set(lang, resourceMap);
    }

    getBundleInfo(bundle: string): Promise<{}> {
        const baseurl = this._config.creds.url;
        const instanceId = this._config.creds.instanceId;
        const bundleInfoUrl = baseurl + '/' +  instanceId + '/v2/bundles/' + bundle;
        if (this._config.uselocal) {
            const bundleData: BundleData = new BundleData();
            if (this._config.localfallbackLang) {
                bundleData.sourceLanguage = this._config.localfallbackLang;
            } else {
              // default to english as source/fallback language for local translations
                bundleData.sourceLanguage = 'en';
            }
            this._cache.putBundleInfo(bundle, bundleData);
            return Promise.resolve(bundleData);
        }
        const bundleData = this._cache.getBundleInfo(bundle);
        if (bundleData) {
            return Promise.resolve(bundleData);
        }
        return new Promise((resolve) => {
            this.http.get(bundleInfoUrl, this.basicHeaders)
            .map(res => res.json())
            .subscribe(
                data => {
                  this._cache.putBundleInfo(bundle, data.bundle);
                  resolve(data.bundle);
                },
                error => {
                    this.handleError('Failed to load bundle info');
                }
            );
        });
    }


    getBrowserLang(): string {
        let browserLang: any = 'en';
        if (window && window.navigator && window.navigator.language) {
            browserLang = window.navigator.language;
        }
        return browserLang;
    }

    fallback(bundle: string, language?: string): string {
        const map = {
                'zh-TW': 'zh-Hant-TW',
                'zh-HK': 'zh-Hant-HK',
                'zh-CN': 'zh-Hans-CN',
                'zh': 'zh-Hans'
        };
        if (!language || 'undefined' === language) {
            language = this._config.defaultLang;
            if (!language) {
                language = this.getBrowserLang();
            }
        }
        if (map.hasOwnProperty(language)) {
             language = map[language]; // fallback for chinese languages
        }
        let splits = language.split('-');
        while (splits.length > 1) {
            splits.pop(); //  zh-Hant-TW --> zh-Hant
            language = splits.join('-');  // [ 'zh', 'Hant' ] --> 'zh-Hant'
        }
        splits = language.split('_'); // en_US --> ['en', 'US']
        while (splits.length > 1) {
            splits.pop(); // ['en', 'US'] --> ['en']
            language = splits.join('_');  // [ 'en' ] --> 'en'
        }
        const bundleData = this._cache.getBundleInfo(bundle);
        if (bundleData) {
            const fallbackLangs: string[] = bundleData.getFallbackLanguages();
            // loading translations from cache (for a fallback language)
            if (fallbackLangs.indexOf(language) < 0 && fallbackLangs.length > 0) {
                for (const index in fallbackLangs) {
                    if (fallbackLangs[index]) {
                        const translations = bundleData.getLangTranslations(fallbackLangs[index]);
                        if (translations) {
                            return fallbackLangs[index];
                        }
                    }
                }
            }
        }
        return language;
    }

    changeLanguage(lang: string): void {
        this.onLangChange.emit({lang: lang});
    }

    handleError(error: any): Promise<any> {
        return Promise.reject(error.message || error);
    }
}
