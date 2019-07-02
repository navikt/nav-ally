const SeleniumWebDriver = require('selenium-webdriver');
const By = SeleniumWebDriver.By;

function ClickOnHandler(validator) {
  function handle(browser, cssString) {
    return browser
      .findElement(By.css(cssString))
      .then(function(element) {
        return element.click();
      })
      .catch(function(err) {
        validator.__exit(1, {
          msg: 'An error occurred when trying to click on [' + cssString + '].',
          err
        });
      });
  }

  return {
    handle
  };
}

module.exports = ClickOnHandler;
