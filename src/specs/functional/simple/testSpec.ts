///<reference path="../../../interfaces/IResponse.ts" />

describe('TestSpec', function() {
    it('Simple test', function(done) {
        browser.get('http://localhost:1000').then(() => {
            element(by.css('#button button')).click();

            browser.wait(function() {
                return element(by.binding('response')).getText().then((text) => text.length > 0);
            }).then(() => {
                element(by.binding('response')).getText().then((responseText) => {
                    console.log('response: ', responseText);

                    expect(responseText.length).toBeGreaterThan(0);
                    var response = <IResponse> JSON.parse(responseText);

                    expect(response).toBeDefined();
                    expect(response.record.id).toBeDefined();

                    done();
                });
            });
        });
    });
});
