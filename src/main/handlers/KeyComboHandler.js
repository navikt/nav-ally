const SeleniumWebDriver = require('selenium-webdriver');

function KeyComboHandler(validator) {

    function handle(keyCombo) {
        let chord = [];
        const keyArr = keyCombo.split(',');
        keyArr.forEach(key => chord.push(validator.__keytype(key, undefined)));
        return SeleniumWebDriver.Key.chord(keyCombo);
    }

    return {
        handle
    }

}

module.exports = KeyComboHandler;