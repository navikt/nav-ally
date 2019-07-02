const SeleniumWebDriver = require('selenium-webdriver');
const By = SeleniumWebDriver.By;
const Until = SeleniumWebDriver.until;

function WaitForHandler(validator) {
  function handle(browser, cssString, timeout) {
    return browser
      .wait(Until.elementsLocated(By.css(cssString)), timeout)
      .catch(function(err) {
        validator.__exit(1, {
          msg:
            'An error occurred while waiting for css element [' +
            cssString +
            ']. Make sure the element exist.',
          err
        });
      });
  }

  return {
    handle
  };
}

module.exports = WaitForHandler;
