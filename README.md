# NAV-ally

## What is this

> An automation tool for testing frontend applications against a set of web accessibility guidelines (WCAG 2 (A, AA, AAA), Section 508 etc).

The tool can be a part of a build pipeline, but can also be used standalone to test any frontend application. You create a list of links in a *definition file* that can
 be either a plain Yaml-configuration or a Javascript based configuration. The tool supports preprocessing of the web sites before validation with an DSL built on top of Selenium Webdriver (ie.
 clicking a button to load additional data). It uses Axe under the hood to preform the actual web accessibility validation.
<br />

## <a id="quick_start"> Quick start

1. Add the module to your project

    `npm install --save-dev nav-ally`

2. Create a Yaml-based definition file and add it anywhere in your project:

    ```
    $ touch wcag.yml
    $ nano wcag.yml
    ```

    Paste in the following example content:
    
    ```yaml
    links:
     - "http://google.com"
    ```

3. Create a run script in your package.json:

    "wcag-test":"nav-ally -f wcag.yml"

4. You can now run the validator:

    `$ npm run wcag-test`

See [this example application](https://github.com/dervism/carparkjs) for a complete NodeJS/Express application that uses the validator. The example application starts a local instance of the application before running the validation.

<br />

## Documentation

[Documentation and code examples](documentation.md)  
[Guide](https://navikt.github.io/nav-ally/api)

## Contact

Questions about the code or the project:

* Dervis Mansuroglu, dervis.mansuroglu@nav.no

## For NAV-employees

If you are a NAV employee, you can also ask questions in the channel #fo on Slack.

### The rest of the codebase (excluding 3rd party dependencies)
Copyright (c) 2017 NAV

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
