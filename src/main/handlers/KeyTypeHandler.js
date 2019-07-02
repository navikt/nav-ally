const SeleniumWebDriver = require('selenium-webdriver');

function KeyTypeHandler(validator) {
  function handle(key, keyCombo) {
    // key combination with stateful and stateless keys
    if (key.toLowerCase() === 'combo' && keyCombo && keyCombo.length > 0)
      return validator.__keyCombo(keyCombo);
    // stateless keys
    else if (key.toLowerCase() === 'tab') return SeleniumWebDriver.Key.TAB;
    else if (key.toLowerCase() === 'enter') return SeleniumWebDriver.Key.ENTER;
    else if (key.toLowerCase() === 'esc') return SeleniumWebDriver.Key.ESCAPE;
    else if (key.toLowerCase() === 'delete')
      return SeleniumWebDriver.Key.DELETE;
    else if (key.toLowerCase() === 'backspace')
      return SeleniumWebDriver.Key.BACK_SPACE;
    // stateful keys that require Key.NULL at the end
    else if (key.toLowerCase() === 'ctrl') return SeleniumWebDriver.Key.COMMAND;
    else if (key.toLowerCase() === 'alt') return SeleniumWebDriver.Key.ALT;
    else if (key.toLowerCase() === 'shift') return SeleniumWebDriver.Key.SHIFT;
    else if (key.toLowerCase() === 'command')
      return SeleniumWebDriver.Key.COMMAND;
    else if (key.toLowerCase() === 'null') return SeleniumWebDriver.Key.NULL;
    // other keys on the keyboard are just returned as is (letters/numbers)
    else return key;
  }

  return {
    handle
  };
}

module.exports = KeyTypeHandler;
