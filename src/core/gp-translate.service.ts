import { Injectable, Input, Inject } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { GpConfig } from './gpconfig';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';

@Injectable()
export class GpTranslateService {
  private _requestOptions: RequestOptions;
  private _config: GpConfig;
  // map of bundle to map of language to resourcesmap
  private _cacheMap: Map<string, Map<string, {}>> = new Map<string, Map<string, {}>>();

  constructor(@Inject(Http) private http: Http) {}

  @Input() set config(config: GpConfig) {
       this._config = config;
   }

   public getConfig(): GpConfig {
     return this._config;
   }

  /**
    Setting up headers (basic authentication) for globalization pipeline instance
  **/
  get basicHeaders(): RequestOptions {
      if (this._requestOptions)
       return this._requestOptions;
      let username: string = this._config.creds.userId;
      let password: string = this._config.creds.password;
      let headers: Headers = new Headers();
      headers.append("Authorization", "Basic " + btoa(username + ":" + password));
      headers.append("Content-Type", "application/x-www-form-urlencoded");
      return new RequestOptions({ headers: headers });
  }

  loadCredentials(url:string): Promise<any> {
    return new Promise((resolve) => {
      this.http.get(url).map(res=>res.json())
        .subscribe(
          creds => {
                  this._config.creds = creds;
                  resolve();
          },
          error => {
                console.log("Failed to load credentials", error)
          });
      });
  }

  loadtranslations(bundle: string, lang: string): Promise<any> {
    return this.getTranslationFromGP(bundle, lang);
  }

  getTranslation(key: string, bundleParam?: string, langParam?: string): Promise<{}> {
    let bundle = this._config.defaultBundle
    let  lang = this._config.defaultLang;
    if (bundleParam)
      bundle = bundleParam;
    if (langParam)
      lang = langParam;
    let resourceLangMap = this._cacheMap.get(bundle);
    if (resourceLangMap) {
      let resourceMap = resourceLangMap.get(lang);
      if (resourceMap != null) {
        return Promise.resolve(resourceMap);
      }
    }
    return this.getTranslationFromGP(bundle, lang);
  }

  getLocalTranslations(bundle: string, lang: string): Promise<{}> {
    let localpath = this._config.localpath;
    if (!localpath)
      localpath = "/assets/i18n";
    return new Promise((resolve) => {
      this.http.get(localpath+"/"+bundle+"/"+lang+".json")
        .subscribe(
            data => {
                this.updateCache(bundle, lang, data.json());
                resolve(data.json());
                  },
            error => {
                console.log("Failed to load translations from local path")
            });
    });
  }

  getTranslationFromGP(bundle: string, lang: string): Promise<{}> {
    if (true === this._config.uselocal) {
      return this.getLocalTranslations(bundle, lang);
    }
    let baseurl = this._config.creds.url;
    let instanceId = this._config.creds.instanceId;
    let bundleUrl = baseurl + "/" +  instanceId +"/v2/bundles/"+bundle+"/"+lang;
    return new Promise((resolve) => {
          this.http.get(bundleUrl, this.basicHeaders)
              .map(res => res.json())
              .subscribe(
                data => {
                        let resourceMap = data.resourceStrings;
                        this.updateCache(bundle, lang, resourceMap);
                        resolve(resourceMap);
                        },
               error => {
                      console.log("Failed to load translations from globalization pipeline instance");
               })
    });
  }

  private updateCache(bundle: string, lang: string, resourceMap: {}): any {
    let langResourceMap = this._cacheMap.get(bundle);
    if (langResourceMap == null) {
      langResourceMap = new Map<string, {}>();
    }
    langResourceMap.set(lang, resourceMap);
    this._cacheMap.set(bundle, langResourceMap);
  }

  getBrowserLang(): string {
        let browserLang: any = window.navigator.language;
        if (browserLang) {
          if (browserLang.indexOf("-") > 0) {
            browserLang = browserLang.split("-")[0];
          }
          if (browserLang.indexOf("_") > 0) {
            browserLang = browserLang.split("_")[0];
          }
        }
        else
          browserLang = "en";
        return browserLang;
    }
}
