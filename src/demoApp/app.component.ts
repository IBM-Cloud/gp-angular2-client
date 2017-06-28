import { Component, OnInit } from '@angular/core';
import { GpTranslateService } from '../core/gp-translate.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
    title = 'Angular2 Client for Globalization Pipeline';

    constructor(private ts: GpTranslateService) {}

    ngOnInit() {}

}
