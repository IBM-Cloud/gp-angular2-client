/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { Http, BaseRequestOptions, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { GpTranslateService } from '../core/gp-translate.service';
import { GpConfig, GpCredentials } from "../core/gpconfig";
import { Observable } from 'rxjs';

let mockBackend: MockBackend;
let gpTranslateService: GpTranslateService;
let gpConfig: GpConfig = new GpConfig();
gpConfig.defaultBundle = "bundle";
gpConfig.defaultLang = "en";
let jsdata = new GpCredentials();

let setup = (httpMock) => {
    TestBed.configureTestingModule({
        providers: [
            GpTranslateService,
            MockBackend,
            BaseRequestOptions,
            {
                provide: Http,
                useFactory: (backend: MockBackend, options: BaseRequestOptions) => new httpMock(backend, options),
                deps: [ MockBackend, BaseRequestOptions ]
            }
        ]
      });
    inject([ MockBackend, Http ],
        (mb: MockBackend, http: Http) => {
            mockBackend = mb;
            gpTranslateService = new GpTranslateService(http);
            gpTranslateService.config = gpConfig;
        }
    )();
};

describe('Service: GpTranslateService', () => {
  it('should load credentials from url', (done) => {
    setup(MockLoadCredentialsHttp);
    //spyOn(gpTranslateService, 'handleError');
    gpTranslateService.loadCredentials("../assets/credentials.json").then(() => {
      console.log(gpTranslateService.getConfig().creds);
      done();
    });
  });

});

class MockLoadCredentialsHttp extends Http {
    constructor(backend, options) {
        super(backend, options);
    }

    get() {
        return Observable.from([ new Response(new ResponseOptions({body: {data: jsdata}})) ]);
    }
}
