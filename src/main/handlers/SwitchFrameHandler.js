function SwitchFrameHandler(validator) {
  function handle(browser, frame) {
    if (frame === 'default') return browser.switchTo().defaultContent();
    return browser
      .switchTo()
      .frame(frame)
      .catch(function(err) {
        validator.__exit(1, {
          msg:
            "An error occurred when trying to switch to frame '" + frame + "'.",
          err
        });
      });
  }

  return {
    handle
  };
}

module.exports = SwitchFrameHandler;
