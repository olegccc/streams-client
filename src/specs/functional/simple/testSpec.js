describe('TestSpec', function() {
    it('Should test', function() {
        browser.get('http://localhost:1000');
        element(by.css('#button button')).click();

        browser.wait(function() {
            return element(by.model('response')).getText().length > 0;
        });

        var response = element(by.model('response')).getText();

        console.log(response);

        // TODO: parse and analyze response

        expect(response.length).toBeGreaterThan(0);
    });
});
