import { GpAngular2ClientPage } from './app.po';

describe('gp-angular2 client App', () => {
  let page: GpAngular2ClientPage;

  beforeEach(() => {
    page = new GpAngular2ClientPage();
  });

  it('should display message saying "Angular2 Client for Globalization Pipeline"', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Angular2 Client for Globalization Pipeline');
  });

  it('should display "Open the file" text for the english translation of "OPEN"', () => {
    page.navigateTo();
    expect(page.getTextInEnglish("open")).toEqual('Open the file');
  });

});
