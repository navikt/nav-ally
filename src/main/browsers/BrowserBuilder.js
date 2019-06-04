const SeleniumWebDriver = require('selenium-webdriver');

const Chrome = require('selenium-webdriver/chrome');

const Firefox = require('selenium-webdriver/firefox');

const {log} = require('../log/log');


function BrowserBuilder() {


    function buildChrome(headless, binaryPath) {
        let builder = new SeleniumWebDriver.Builder().forBrowser('chrome');
        const options = new Chrome.Options();
        if (headless) {
            if (binaryPath) {
                options.setChromeBinaryPath(binaryPath);
                log('Chrome running with binary: ' + binaryPath);
            }
            options.headless();
        }
        options.addArguments([
            'no-sandbox',
            'allow-running-insecure-content',
            'disable-dev-shm-usage',
            'disable-software-rasterizer'
        ]);
        options.setAcceptInsecureCerts(true);
        builder.withCapabilities(options);
        return builder.build();
    }

    function buildFirefox(headless, binaryPath) {
        let builder = new SeleniumWebDriver.Builder().forBrowser('firefox');
        const options = new Firefox.Options();
        if (headless) {
            if (binaryPath) {
                options.setBinary(binaryPath);
                log('Firefox running with binary: ' + binaryPath);
            }
            options.headless();
        }
        options.setAcceptInsecureCerts(true);
        builder.setFirefoxOptions(options);
        return builder.build();
    }

    return {
        buildChrome,
        buildFirefox
    }

}

module.exports = BrowserBuilder;