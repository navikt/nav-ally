const SeleniumWebDriver = require('selenium-webdriver');
const By = SeleniumWebDriver.By;

function KeyboardHandler(validator) {

    function handle(browser, keyType, keyCombo = [], elementCss = 'body') {
        return browser
            .findElement(By.css(elementCss))
            .then(function(element) {
                const keyTypeId = validator.__keytype(keyType, keyCombo);
                return element.sendKeys(keyTypeId);
            })
            .catch(function(err) {
                validator.__exit(1, {
                    msg:
                        'An error occurred. Could not press key [' +
                        keyType +
                        '] Should be one of tab/enter/esc/backspace/delete/alt/shift/ctrl|command.',
                    err
                });
            });
    }

    return {
        handle
    }

}

module.exports = KeyboardHandler;