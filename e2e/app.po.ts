import { browser, element, by } from 'protractor';

export class GpAngular2ClientPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }

  getText(className) {
    return element(by.className(className)).getText();
  }

  changeLanguage(language) {
    element(by.cssContainingText('option', 'es')).click();
  }
}
