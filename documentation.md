## Documentation
- [Quick start](#quick_start)
- [Using NAV-Ally in your project](#using_in_project)
- [Global configuration](#configuration)
    - [Validation rules](#validation_rules)
    - [Test execution and assertation](#test_execution_and_assertation)
- [Definition file](#definition_file)
    - [Simple example](#simple_example)
    - [Overriding global settings with link options](#overriding_options)
    - [Pre-validation tasks with the validation DSL](#validation_dsl)
        - [Waiting for something to load](#waitFor)
        - [Select an option from a dropdown box](#selectOption)
        - [Write text into an element](#type)
        - [Click an element](#clickOn)
        - [Click an element and wait for another element](#clickAndWait)
        - [Advanced example - executing multiple commands with chaining](#advanced_example)
        - [Advanced example - select an option from a dropdown box](#advanced_example_dropdown)

## <a id="using_in_project"> Using NAV-Ally in your project

Clone the repo: `git clone https://github.com/navikt/nav-ally.git` or download a copy from https://github.com/navikt/nav-ally

Summary:
1. Create a definition file using the validation DSL (see below)
2. Set the DEFINITION_FILE environment variable to point to the file you created
3. Set any optional configuration environment variables (see configuration options below)
4. Run the `npm start` command.
5. Node will fail with a none-zero value when there is test errors.

## <a id="configuration"> Global configuration
You can configure the tool with the following global variables. The variables can be exported or configured from the commandline or through the system environment.

|Name|Type|Default Value|Required|Description|
|----|----|-------------|--------|-----------|
|CHROME_BINARY|`string`||Only on Linux|Chrome browser binary file path. Only needed on Linux/Unix systems|
|FIREFOX_BINARY|`string`||Only on Linux|Firefox browser binary file path. Only needed on Linux/Unix systems|
|BROWSER|`string`|chrome|No|Default browser to test when it's not defined in the definition file. Can be overridden pr link.|
|HEADLESS|`boolean`|true|No|If set to `true` the browser runs in headless mode.|

### <a id="validation_rules"> Validation rules
|Name|Type|Default Value|Required|Description|
|----|----|-------------|--------|-----------|
|DEFINITION_FILE|`string`||Yes|File path to a Yaml or Javascript definition file.|
|TAGS|`string`|**See below|No|Which rules and/or categories should the validator apply as default. Can be overridden on a link in the definition file.|

#### <a id="axe_tags">**All the accessibility rule groups / categories available in Axe:
wcag2a,wcag2aa,wcag2aaa,section508,best-practice,experimental,cat.aria,cat.color,cat.text-alternatives,cat.time-and-media,cat.tables, 
cat.semantics,cat.sensory-and-visual-cues,cat.parsing,cat.structure,cat.name-role-value,cat.keyboard,cat.forms,cat.language

#### All accessibility rules supported by Axe:

https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md 

### <a id="test_execution_and_assertation"> Test execution and assertation
|Name|Type|Default Value|Required|Description|
|----|----|-------------|--------|-----------|
|NAME|`string`|UU Test|No|The test execution title|
|DETAILED_REPORT|`boolean`|true|No|If set to `false` will print out only a summary.|
|ASSERT_WARNINGS|`boolean`|false|No|If set to `true` will also trigger assertation on warnings (that is, violations that need review).|
|TIMEOUT|`integer`|300000|No|Browser script timeout|
<br />
  
## <a id="definition_file"> Definition file
The definition file consist of a list of URL's and optional commands that you can combine in order to describe how a particular web site should be prepared before testing.
<br />
  
### <a id="simple_example"> Simple examples
This is the simplest form of a definition file. It consists only of an array of links. 

Yaml - see [simple-definition.yml](src/test/definitions/simple-definition.yml):
```yaml
    links:
      - link: 'https://alphagov.github.io/accessibility-tool-audit/test-cases.html'
```

Javascript - see [simple-definition.js](src/test/definitions/simple-definition.js):
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

  
### <a id="validation_dsl"> Preforming actions before validation
These examples shows how to define options to customize the behaviour of the test execution. The options are tasks that 
are run by Selenium before the validation is executed using Axe. The way this works is by first loading the specified link, then executing any tasks 
specified under the `commands` list in the given order and then finally validating the resulting web page.    

<a id="command_list"> This is the list of supported commands:

|Command|Type|Options|Description|
|------|-----|-------|-----------|
|[waitFor](#waitFor)|String||A CSS-selector that tell which element to wait for.|
|[clickOn](#clickOn)|String||A CSS-selector that tells which element to click on.|
|[clickAndWait](#clickAndWait)|Object|clickOn, waitFor|To make the config more readable, waitFor can also be renamed _thenWaitFor_|
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

Yaml - see [typeinto-definition.yml](src/test/definitions/typeinto-definition.yml):
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

#### <a id="clickAndWait"> **clickAndWait** - Click an element and then wait for another element
In this example we click on the element `#menuItem + label` and then wait for the element `.result-table` to be visible. 
The validation of the page is then executed. If the element `.result-table` does not exist, an error is thrown and the 
validator exists with status code 1. The values of `clickAndWait.clickOn` `clickAndWait.thenWaitFor` is a fully qualified CSS selectors.

Yaml:
```yaml
    links:
      - link: 'http://localhost:3000/lorem/ipsum'
        options:
          commands:
            - clickAndWait:
                clickOn: '#menuItem + label'
                thenWaitFor: '.result-table'
```

Javascript
```javascript
    exports.links = [
        {
            link: 'http://localhost:3000/lorem/ipsum', 
            options: { 
                commands: [
                    { clickAndWait: { clickOn: '#menuItem + label', thenWaitFor: '.result-table' } }
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


### <a id="advanced_example"> Advanced example - executing multiple commands with chaining
This example shows how to run several commands synchronized. The example defines links to two web sites that will be validated. For the first link in this example, we tell Selenium to:

1. go to the link http://localhost:3000/lorem/ipsum
2. then wait for the element named `.lorem-page` to become visible
3. then wait for `.ipsum-content` to become visible
4. then click on the element identified by the `#menuItem + label` (ie. a custom radio button)
5. then wait for the `.result-table` element to become visible.
6. and then run the validation on page
7. go to the second link http://localhost:3000/dolor/sit/amet
8. and then run the validation on the next page (no options are defined so validation is run directly).

Yaml:
```yaml
    links:
      - link: 'http://localhost:3000/lorem/ipsum'
        options:
          commands:
            - waitFor: '.lorem-page'
            - waitFor: '.ipsum-content'
            - clickAndWait:
                 clickOn: '#menuItem + label'
                 thenWaitFor: '.result-table'
      - link: 'http://localhost:3000/dolor/sit/amet'
```

Javascript
```javascript
    exports.links = [
        {
            link: 'http://localhost:3000/lorem/ipsum',
            options: {
                commands: [
                    { waitFor: '.lorem-page' },
                    { waitFor: '.ipsum-content' },
                    { clickAndWait: {clickOn: '#menuItem + label', thenWaitFor: '.result-table' } }
                ]
            }
        },
        { link: 'http://localhost:3000/dolor/sit/amet' }
    ];
```

The values of `waitFor` and `clickAndWait` options is a fully qualified CSS selector.  `clickAndWait` is a command that can be 
used to click/select radios, checkboxes and buttons and then wait for another element with the `thenWaitFor` option.

### <a id="advanced_example_dropdown"> Advanced example - select an option from a dropdown box
This example shows how to combine several commands together. The example defines two links that will be validated. For the first link in this example, we tell Selenium to:

1. go to the link
2. then wait for the element named `#header` to become visible
3. then select the option `Lorem Ipsum` from the dropdown box `#header select`
4. then wait for the element named `.lorem-element` to become visible
5. and finally run the validation

Yaml:
```yaml
    links:
      - link: 'http://localhost:3000/lorem/ipsum'
        options:
          commands:
            - waitFor: '#header'
            - selectOption:
                from: '#header select'
                option: 'Lorem Ipsum'
            - waitFor: '.lorem-element'
      - link: 'http://localhost:3000/dolor/sit/amet'
```

Javascript:
```javascript
    exports.links = [
        {
            link: 'http://localhost:3000/lorem/ipsum',
            options: {
                commands: [
                    { waitFor: '#header' },
                    { selectOption: { from: '#header select', option: 'Lorem Ipsum' } },
                    { waitFor: '.lorem-element' }
                ]
            }
        }
    ];
```