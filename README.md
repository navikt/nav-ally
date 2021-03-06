# NAV-ally

![](https://img.shields.io/docker/pulls/navikt/nav-ally.svg)
![](https://img.shields.io/npm/dw/nav-ally.svg?label=npm-downloads)
![](https://img.shields.io/npm/v/nav-ally.svg?label=npm-version)
![](https://img.shields.io/npm/l/nav-ally.svg)
![](https://img.shields.io/snyk/vulnerabilities/npm/nav-ally.svg)

## What is this

> An automation tool for testing frontend applications against a set of web accessibility guidelines (WCAG 2 (A, AA, AAA), Section 508 etc).

The tool can be a part of a build pipeline, but can also be used standalone to test any frontend application. You create a list of links in a *definition file* that can
 be either a plain Yaml configuration or a Javascript based configuration. The tool supports preprocessing of the web sites before validation with an DSL built on top of Selenium Webdriver (ie.
 clicking a button to load additional data). It uses Axe under the hood to preform the actual web accessibility validation.
<br />

## <a id="quick_start"> Quick start

You must have ChromeDriver installed and set in the path, before starting. On MacOS/Linux, you can do that easily with Brew:

1. `$ brew cask install chromedriver`

    If you are planning to integrate with Jenkins, read about the [Docker-setup here](docker/README.md).

    If you need to install ChromeDriver manually on Linux, see this [Docker file](docker/Dockerfile).

2. Add the module to your project

    `npm install --save-dev nav-ally`

3. Create a Yaml-based definition file and add it anywhere in your project:

    ```
    $ touch wcag.yml
    $ nano wcag.yml
    ```

    Paste in the following example content:

    ```yaml
    links:
     - "http://google.com"
    ```

4. Create a run script in your package.json:

    "wcag-test":"nav-ally -f wcag.yml"

    See more command line arguments [in the documentation](documentation.md#cli)  

5. You can now run the validator:

    `$ npm run wcag-test`

See [this example application](https://github.com/dervism/carparkjs) for a complete NodeJS/Express application that uses the validator. The example application starts a local instance of the application before running the validation.

## Docker image

[Documentation and code examples](docker/README.md)  

## Documentation

[Documentation and code examples](documentation.md)  

## Contact

Questions about the code or the project:

* Dervis Mansuroglu, dervis.mansuroglu@nav.no

## The rest of the codebase (excluding 3rd party dependencies)
Copyright (c) 2019 NAV

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
