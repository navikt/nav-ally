---
layout: default
title: Working with the definition file
nav_order: 4
has_children: true
---

# On this page:
- [Definition file](#definition_file)
    - [Simple example](#simple_example)
    - [Overriding global settings with link options](#overriding_options)
    - [Pre-validation commands/actions with the validation DSL](#validation_dsl)
        - [Waiting for something to load](#waitFor)
        - [Select an option from a dropdown box](#selectOption)
        - [Write text into an element](#type)
        - [Click an element](#clickOn)
        - [Pause the execution](#pause)

## <a id="definition_file"> Definition file
The definition file consist of a list of URL's and optional commands that you can combine in order to describe how a particular web site should be prepared before testing.
<br />

### <a id="simple_example"> Simple examples
This is the simplest form of a definition file. It consists only of an array of links.

Yaml - see [alphagov.yml](src/test/definitions/alphagov.yml):
```yaml
    links:
      - link: 'https://alphagov.github.io/accessibility-tool-audit/test-cases.html'
```

Javascript - see [alphagov.js](src/test/definitions/alphagov.js):
```javascript
    exports.links = [
        {link: 'https://alphagov.github.io/accessibility-tool-audit/test-cases.html'}
    ];
```

Here is another example with multiple links:

Yaml - see [nav.yml](src/test/definitions/nav.yml):
```yaml
    links:
      - 'https://www.nav.no/no/NAV+og+samfunn/Kontakt+NAV/Kontakt+oss/kontakt-nav-på-telefon'
      - 'https://www.nav.no/no/Person/Arbeid/Arbeidsledig+og+jobbsoker'
      - 'https://www.nav.no/no/Person/Pensjon/Alderspensjon'
```

### <a id="overriding_options"> Overriding global settings with link options
Its possible to override some of the default settings on individual links by specifying extra options:

|Option|Values|Default|Description|
|------|------|-------|-----------|
|ignoreRules|rules|All rules are activated|Comma separated array of rules to ignore. Ie. "hidden-content, color-contrast"|
|tags|one of [these tags](#axe_tags)|All tags are activated|Limits the validation to only the specified array of tags. Ie. "wcag2a,wcag2aa,best-practice"|
|browser|Firefox or Chrome|Chrome|Test the link with a specific browser. This setting will then override the BROWSER environment variable. |
|command|One or several of the [commands listed below](#command_list)|Optional|Constructs a chain of commands that preforms actions on the link before running validation. Validation is ran right after the last command has completed.|

#### <a id="simple_option_examples"> Example
Note that with Yaml, you have to start the URL with the key `link:`. In this example we define two links, one without options and another that configures
the validator to run the validation in Firefox with only the given three rule categories (one of [these tags](#axe_tags)), but without the _hidden-content_ rule:

```yaml
    links:
      - 'https://www.nav.no/no/Person/Pensjon/Alderspensjon'
      - link: 'https://www.nav.no'
        options:
          browser: "firefox"
          ignoreRules: "hidden-content"
          tags: "wcag2a,wcag2aa,best-practice"
```

The same example written in Javascript:

```javascript
    exports.links = [
    	{ link: 'https://www.nav.no/no/Person/Pensjon/Alderspensjon' },
        { link: 'http://www.nav.no',
            options: {
                browser: "firefox",
                ignoreRules: "hidden-content",
                tags: "wcag2a,wcag2aa,best-practice"
            }
        }
    ];
```


### <a id="validation_dsl"> Preforming commands/actions before validation
These examples shows how to define options to customize the behaviour of the test execution. The options are tasks that
are run by Selenium before the validation is executed using Axe. The way this works is by first loading the specified link, then executing any tasks
specified under the `commands` list in the given order and then finally validating the resulting web page.    

<a id="command_list"> This is the list of supported commands:

|Command|Type|Options|Description|
|------|-----|-------|-----------|
|[waitFor](#waitFor)|String||A CSS-selector that tell which element to wait for.|
|[clickOn](#clickOn)|String||A CSS-selector that tells which element to click on.|
|[pause](#pause)|Integer||Number of millis to pause the execution while running commands. Useful f.ex. then you need to wait for CSS-animations to finish.|
|[type](#type)|Object|into, text, key (optional)|Enter text into an element. `into`: CSS-selector, `text`: the value to type in. `key` can be one of the stateless keys on the keyboard: `enter`, `tab`, `esc`, `backspace`, `delete`.|
|[selectOption](#selectOption)|Object|from, option|Select an option from an dropdown element.|
|keyboard|Object|keyType, keyCombo (optional), element (optional)|Press keys on the keyboard. `element`: CSS-selector defining where to type, default value is "body". `keyCombo`: comma separated string of keys. (letter, numbers, stateless keys (`enter`, `tab`, `esc`, `backspace`, `delete`), statefull keys (`ctrl`, `alt`, `shift`, `command`))|

See examples of valid CSS-selectors:

https://www.testingexcellence.com/css-selectors-selenium-webdriver/
https://saucelabs.com/resources/articles/selenium-tips-css-selectors

#### <a id="waitFor"> **waitFor** - Waiting for something to load
In this example we tell Validator to go to the link given and then wait for the element named `.content` to become visible before
it executes the validation. The value
of the `waitFor` option is a fully qualified CSS selector. If the element `.content` does not exist, an error
is thrown and the validator exists with status code 1.

Yaml:
```yaml
    links:
      - link: 'http://localhost:3000/lorem/ipsum'
        options:
          commands:
              - waitFor: '.content'
```

Javascript:
```javascript
    exports.links = [ {
            link: 'http://localhost:3000/lorem/ipsum',
            options: {
                commands: [
                    { waitFor: '.content' }
                ]
            }
        } ];
```

#### <a id="selectOption"> **selectOption** - Select an option from a dropdown box
In this example we tell Validator to go to the link and then select the option with the text 'Lorem Ipsum'.
The value of `selectOption.from` is a fully qualified CSS selector.

Yaml:
```yaml
    links:
      - link: 'http://localhost:3000/lorem/ipsum'
        options:
          commands:
            - selectOption:
                from: '#header select'
                option: 'Lorem Ipsum'
```

Javascript:
```javascript
    exports.links = [
        {
            link: 'http://localhost:3000/lorem/ipsum',
            options: {
                commands: [
                    { selectOption: { from: '#header select', option: 'Lorem Ipsum' } }
                ]
            }
        }
    ];
```

#### <a id="type"> **type** - Write text into an element
In this example we write the text 'Lorem Ipsum' into text element specified in the property typeInto.
The value of `type.into` is a fully qualified CSS selector.

Yaml:
```yaml
    links:
      - link: 'http://localhost:3000/lorem/ipsum'
        options:
          commands:
            - type:
                into: '#username'
                text: 'Lorem Ipsum'
```

Javascript:
```javascript
    exports.links = [
        {
            link: 'http://localhost:3000/lorem/ipsum',
            options: {
                commands: [
                    { type: { into: '#username', text: 'Lorem Ipsum' } }
                ]
            }
        }
    ];
```

You can also specify an optional control key that will be pressed on the keyboard. You can do this by adding the extra `key` option. The value of the key should be
any of the stateless keys on the keyboard: `enter`, `tab`, `esc`, `backspace`, `delete`.

Yaml - see [typeinto.yml](src/test/definitions/typeinto.yml):
````yaml
links:
  - link: "http://www.nav.no"
    options:
      commands:
        - waitFor: '.siteheader'
        - type:
            into: "#site-search-input"
            text: "Pensjon"
            key: "enter"
````

#### <a id="clickOn"> **clickOn** - Click an element
In this example we click on the element `#btnNextPage`. The validation of the page is then executed right after. If the element `#btnNextPage` does not exist, an error is thrown and the
validator exists with status code 1. The values of `clickOn` is a fully qualified CSS selectors.

Yaml:
```yaml
    links:
      - link: 'http://localhost:3000/lorem/ipsum'
        options:
          commands:
            - clickOn: '#btnNextPage'
```

Javascript
```javascript
    exports.links = [
        {
            link: 'http://localhost:3000/lorem/ipsum',
            options: {
                commands: [
                    { clickOn: '#btnNextPage' }
                ]
            }
        }
    ];
```

#### <a id="pause"> **pause** - Pause the execution  
In this example we click on the element `#btnNextPage` and then pause the execution for 3 seconds to give the browser some time to load data or finish the execution of f.ex. animations on the page.
The value of `pause` is a millis integer.

Yaml:
```yaml
    links:
      - link: 'http://localhost:3000/lorem/ipsum'
        options:
          commands:
            - clickOn: '#btnNextPage'
            - pause: 3000
```

Javascript
```javascript
    exports.links = [
        {
            link: 'http://localhost:3000/lorem/ipsum',
            options: {
                commands: [
                    { clickOn: '#btnNextPage' },
                    { pause: 3000 }
                ]
            }
        }
    ];
```
