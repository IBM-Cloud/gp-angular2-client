import { GpAngular2ClientPage } from './app.po';

describe('verify translations', () => {
    let page: GpAngular2ClientPage;

    beforeAll(() => {
        page = new GpAngular2ClientPage();
        page.navigateTo();
    });

    it('should display message saying "Angular2 Client for Globalization Pipeline"', () => {
        expect(page.getParagraphText()).toEqual('Angular2 Client for Globalization Pipeline');
    });

    it('should display "Open the file" text for the default translation of "OPEN" key', () => {
        expect(page.getText('open_defaultlang')).toEqual('Open the file');
    });

    it('should display "Cierra el archivo" text for spanish translation of "CLOSE" key', () => {
        expect(page.getText('close_spanish')).toEqual('Cierre el archivo');
    });

    it('should display "Edit the file" text for cyrllic translation of "EDIT" key as qru is not a target language', () => {
        expect(page.getText('edit_fallback_lang')).toEqual('Edit the file');
    });

    it('should display "Save the folder" text for english translation of "SAVE" key from non-default bundle', () => {
        expect(page.getText('save_different_bundle')).toEqual('Save the folder');
    });

    it('should display "Guarde la carpeta" text for spanish translation of "SAVE" key with pipe from non-default bundle', () => {
        expect(page.getText('pipe_save_diffbundle')).toEqual('Guarde la carpeta');
    });

});

describe('verify translations on language change', () => {
    let page: GpAngular2ClientPage;

    beforeAll(() => {
        page = new GpAngular2ClientPage();
        page.navigateTo();
        page.changeLanguage('es');
    });

    it('should display message saying "Angular2 Client for Globalization Pipeline"', () => {
        expect(page.getParagraphText()).toEqual('Angular2 Client for Globalization Pipeline');
    });

    it('should display "Open the file" text for the default translation of "OPEN" key', () => {
        expect(page.getText('open_defaultlang')).toEqual('Abra el archivo');
    });

    it('should display "Cierra el archivo" text for default translation of "CLOSE" key on language change' , () => {
        expect(page.getText('close_default')).toEqual('Cierre el archivo');
    });

    it('should display "Edit the file" text for cyrllic translation of "EDIT" key as qru is not a target language', () => {
        expect(page.getText('edit_fallback_lang')).toEqual('Edit the file');
    });

    it('should display "Save the folder" text for english translation of "SAVE" key from non-default bundle', () => {
        expect(page.getText('save_different_bundle')).toEqual('Save the folder');
    });

    it('should display "Guarde la carpeta" text for spanish translation of "SAVE" key with pipe from non-default bundle', () => {
        expect(page.getText('pipe_save_diffbundle')).toEqual('Guarde la carpeta');
    });

});
