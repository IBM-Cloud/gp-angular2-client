import { GpAngular2ClientPage } from './app.po';

describe('gp-angular2 client App', () => {
  let page: GpAngular2ClientPage;

  beforeEach(() => {
    page = new GpAngular2ClientPage();
  });

  it('should display message saying "Angular Client for Globalization Pipeline"', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Angular Client for Globalization Pipeline');
  });
});
