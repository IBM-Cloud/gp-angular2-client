import { Component, OnInit } from '@angular/core';
import { GpTranslateService } from '../core/gp-translate.service';
@Component({
    selector: 'feature-1',
    templateUrl: './feature-1.component.html'
})
export class Feature1Component implements OnInit {
    title = 'feature component';
    public bundle = 'bundle1';
    public lang = 'en';
    constructor(private ts: GpTranslateService) {}
    ngOnInit() {
        const inferParam = {'param' : 'data'};
        this.ts.getTranslation('TEMPLATE', inferParam, 'bundle2', 'en').then( (data) => {
          console.log('testing loading params', data);
        });
    }

}
