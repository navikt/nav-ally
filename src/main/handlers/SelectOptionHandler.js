const SeleniumWebDriver = require('selenium-webdriver');
const By = SeleniumWebDriver.By;

function SelectOptionHandler(validator) {

    function handle(browser, cssDropDown, cssOptionText) {
        return browser
            .findElement(By.css(cssDropDown))
            .then(function(element) {
                return element.sendKeys(cssOptionText);
            })
            .catch(function(err) {
                validator.__exit(1, {
                    msg:
                        'An error occurred while selecting option [' +
                        cssOptionText +
                        '] from element [' +
                        cssDropDown +
                        ']. Make sure the element exist.',
                    err
                });
            });
    }

    return {
        handle
    }
}

module.exports = SelectOptionHandler;