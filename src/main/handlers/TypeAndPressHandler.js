
function TypeAndPressHandler(validator) {

    function handle(browser, cssTypeInto, textToType, key) {

        return validator.__type(browser, cssTypeInto, textToType)
            .then(function() {
                return validator.__keyboard(browser, key, [], cssTypeInto);
            })
            .catch(function(err) {
                validator.__exit(1, {
                    msg:
                        'An error occurred while sending text into element [' +
                        cssTypeInto +
                        '] and pressing key [' +
                        key +
                        ']. Make sure the element exist.',
                    err
                });
            });
    }

    return {
        handle
    }

}

module.exports = TypeAndPressHandler;