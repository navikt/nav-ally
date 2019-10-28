const Validator = require('../../main/validator');

const chai = require('chai');
const assert = chai.assert;
const expect = chai.expect;

const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../validation/fail-tests/select-option-test/index.html');
const source   = fs.readFileSync(filePath,'utf8').toString();

let validator = null;
let browser = null;
let timeout = 10000;

const buttonSelector = "#inputSection > button";

describe('tests', function() {
  this.timeout(timeout);

  describe('select an option', () => {
    function createDom() {
      return source;
    }

    before(async function() {
      validator = new Validator({});
      browser = validator.createChrome(true);
      await browser.get("data:text/html;charset=utf-8," + createDom());
    });

    after(async function() {
      browser.quit();
    });

    it('should select c', async function() {
      const option = await validator.__selectOption(browser, '#typeSelect', 'c');
      assert.equal(option, 'c');
    });

    it('should select b', async function() {
      await validator.__clickOn(browser, buttonSelector);
      const option = await validator.__selectOption(browser, '#typeSelect', 'b');
      assert.equal(option, 'b');
    });

    it('should select a', async function() {
      await validator.__clickOn(browser, buttonSelector);
      const option = await validator.__selectOption(browser, '#typeSelect', 'a');
      assert.equal(option, 'a');
    });

    it('should select a if unknown', async function() {
      await validator.__clickOn(browser, buttonSelector);
      const option = await validator.__selectOption(browser, '#typeSelect', 't');
      assert.equal(option, 'a');
    });
  });
});