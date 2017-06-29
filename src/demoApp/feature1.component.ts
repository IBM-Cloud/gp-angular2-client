import { Component, OnInit } from '@angular/core';
import { GpTranslateService } from '../core/gp-translate.service';
@Component({
    selector: 'feature1',
    templateUrl: './feature1.component.html'
})
export class Feature1Component implements OnInit {
    title = 'feature component';
    public bundle: string = "bundle1"
    public lang: string = "en";
    constructor(private ts: GpTranslateService) {}
    ngOnInit() {
        this.ts.loadtranslations(this.bundle, this.lang);
    }

}
