const Validator = require('../../main/validator');

const assert = require('chai').assert;
const mochaHooks = require('../hooks');

let validator = null;
let browser = null;

describe('tests', function() {
  describe('find elements and check values', () => {
    function createDom() {
      return `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <title>test</title>
                        <meta charset="utf8">
                    </head>
                    <body>
                      <div id="id1">
                        Hello,
                        <span class="cls1">World!</span>
                        <div class="cls1">
                          <button class="cls2">OK</button>
                        </div>
                      </div>
                      <div id="id2">
                        <div class="cls1">Bye</div>
                      </div>
                    </body>
                    </html>
                  `;
    }

    before(async function() {
      validator = new Validator([
        {link: "data:text/html;charset=utf-8," + createDom(),
          options: {
            commands: [ {waitFor: 'body'} ]
          }
        }
      ]);
      browser = validator.createChrome(true);
      mochaHooks.addBrowser(browser);
      await browser.get("data:text/html;charset=utf-8," + createDom());

      this.timeout(20000);
    });

    it('should find two values', async function() {
      const val1 = await validator.__find(browser, 'css', '.cls1').then(async (el) => await el.getText());
      assert.equal(val1, 'World!');

      const val2 = await validator.__find(browser, 'css', '#id1 div.cls1').then(async (el) => await el.getText());
      assert.equal(val2, 'OK');
    });
  });
});
