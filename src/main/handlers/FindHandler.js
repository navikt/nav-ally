const SeleniumWebDriver = require('selenium-webdriver');
const By = SeleniumWebDriver.By;

function FindHandler(validator) {
  function handle(browser, type, selector) {
    let locator = {};

    if (type.toLowerCase() === 'xpath') locator = By.xpath(selector);
    else if (type.toLowerCase() === 'linktext') locator = By.linkText(selector);
    else if (type.toLowerCase() === 'name') locator = By.name(selector);
    else if (type.toLowerCase() === 'classname')
      locator = By.className(selector);
    else if (type.toLowerCase() === 'id') locator = By.id(selector);
    else locator = By.css(selector);

    return browser
      .findElement(locator)
      .then(element => {
        return element;
      })
      .catch(function(err) {
        validator.__exit(1, {
          msg:
            'An error occurred when trying to find element [' + selector + '].',
          err
        });
      });
  }

  return {
    handle
  };
}

module.exports = FindHandler;
