const path = require('path');

describe('tests', () => {
  describe('chaining', () => {
    function createDom() {
      document.body.innerHTML = `
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
                  `;
    }

    before(async function() {
      this.timeout(20000);
      // await validator.get('file://' + path.resolve(__dirname, 'blank.html'));
      // await validator.executeScript(createDom);
    });

    it('should ..', async function() {
      // assert.equal(await validator.find('.cls1').getText(), 'World!');
      // assert.equal(await validator.find('#id1 div.cls1').getText(), 'OK');
    });
  });
});
