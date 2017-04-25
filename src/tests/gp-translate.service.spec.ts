/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { GpTranslateService } from '../core/gp-translate.service';

describe('GpTranslateService', () => {
  let translateService: GpTranslateService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[ GpTranslateService ],
      declarations: [
        GpTranslateService
      ],
    });
  });

  it('should do nothing', async(() => {
    expect("nothing").toBeTruthy();
  }));

});
