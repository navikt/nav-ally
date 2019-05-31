const SeleniumWebDriver = require('selenium-webdriver');
const By = SeleniumWebDriver.By;

function TypeHandler(validator) {

    function handle(browser, cssTypeInto, textToType) {
        return browser
            .findElement(By.css(cssTypeInto))
            .then(function(element) {
                return element.sendKeys(textToType);
            })
            .catch(function(err) {
                validator.__exit(1, {
                    msg:
                        'An error occurred while sending text into element [' +
                        cssTypeInto +
                        ']. Make sure the element exist.',
                    err
                });
            });
    }

    return {
        handle
    }
}

module.exports = TypeHandler;