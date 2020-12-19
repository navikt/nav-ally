
const browsers = [];

exports.addBrowser = function(browser) {
  browsers.push(browser);
}

exports.mochaHooks = {
  beforeAll(done) {
    done();
  },
  afterAll(done) {
    console.log("Quitting " + browsers.length + " browsers.");
    browsers.forEach((browser, i) => {
      browser.quit();
    });
    done();
  }
}
