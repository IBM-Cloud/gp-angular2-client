import { inject, TestBed, async } from '@angular/core/testing';

import { GpTranslateService } from '../core/gp-translate.service';
import { GpConfig } from '../core/gpconfig';
// Make sure to include the Response object from '@angular/http'
import { HttpModule, Http, RequestOptions } from '@angular/http';

let translateService: GpTranslateService;
let config: GpConfig = new GpConfig();
config.defaultBundle = "bundle2";
config.defaultLang = "en";
let credjson: string = "../assets/credentials.json";
describe("GpTranslateService- using remote service instance", () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
              GpTranslateService,
              GpConfig
            ],
            imports: [HttpModule]
        });
    });

    beforeEach(inject([GpTranslateService], (ts: GpTranslateService) => {
        translateService = ts;
        translateService.config = config;

    }));

    it("shoud be able to load credentials", async(() => {
        return translateService.loadCredentials(credjson).then((data) => {
            expect(data).toBeDefined();
            expect(data["url"]).toBeDefined();
            expect(data["userId"]).toBeDefined();
            expect(data["password"]).toBeDefined();
            expect(data["instanceId"]).toBeDefined();
        })
    }));

    it("should be able to get bundle info for a bundle uploaded on GP instance", async(() => {
        return translateService.loadCredentials(credjson).then(() => {
            return translateService.getBundleInfo("bundle1").then((data) => {
                expect(data).toBeDefined();
                expect(data["sourceLanguage"]).toBeDefined();
                expect(data["targetLanguages"]).toBeDefined();
            });
        })
    }));

    it("should be able to get translation for a key when bundle and language are specified", async(() => {
        return translateService.loadCredentials(credjson).then(() => {
            return translateService.getTranslation("SAVE", "bundle1", "en").then((dataMap) => {
                expect(dataMap).toBeDefined();
                expect(dataMap["SAVE"]).toEqual("Save the file");
            });
        });
    }));

    it("should be able to get translation for a key using default bundle and language", async(() => {
        return translateService.loadCredentials(credjson).then(() => {
            return translateService.getTranslation("SAVE").then((dataMap) => {
                expect(dataMap).toBeDefined();
                expect(dataMap["SAVE"]).toEqual("Save the folder");
            });
        });
    }));
});
