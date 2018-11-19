# NAV-ally

## What is this

> An automation tool for testing frontend applications against a set of web accessibility guidelines (WCAG 2 (A, AA, AAA), Section 508 etc). 

The tool can be a part of a build pipeline, but can also be used standalone to test any frontend application. You create a list of links in a *definition file* that can 
 be either a plain Yaml-configuration or a Javascript based configuration. The tool supports preprocessing of the web sites before validation with an DSL built on top of Selenium Webdriver (ie. 
 clicking a button to load additional data). It uses Axe under the hood to preform the actual web accessibility validation.
<br />

## <a id="quick_start"> Quick start

1. Clone the project   
    `git clone https://github.com/navikt/nav-ally.git`  
    `cd nav-ally`  
  
2. Exported the path to the Webdriver you want to use (one or both):  
    Chrome: `export PATH=$PATH:/path/to/chromedriver`  
    Firefox: `export PATH=$PATH:/path/to/geckodriver`  
    
    Windows: Add these system environment variables through the control panel under advanced system settings.  
    
    Important: The webdriver must be named "chromedriver" or "geckodriver" in order to be discovered automatically. 
        
3. Run following command to start the Validator with a given definition file:
    `$ DEFINITION_FILE="./src/test/definitions/simple-definition.yml" npm start`  

    You can also start the validator with the run script:
    `$ sh run.sh ./src/test/definitions/simple-definition.yml`
    
Sample commandline output: [example-output.txt](example-output.txt)
<br />

## Documentation

[Documentation and code examples](documentation.md)

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