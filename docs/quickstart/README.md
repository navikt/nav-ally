---
layout: default
title: Using NAV-Ally in your project
nav_order: 2
description: "How to use NAV-Ally"
has_children: true
---

# On this page:
- [Using NAV-Ally in your project](#using_in_project)
- [Web Driver and Docker setup](#webdriversetup)
- [As a module in your existing project](#existingproject)
- [Running NAV-Ally standalone](#standalone)
- [Command line arguments](#cli)


## <a id="using_in_project"> Using NAV-Ally in your project

### <a id="webdriversetup"> Web Driver and Docker setup

You must have a web driver installed and set in the path, before starting. On MacOS/Linux, you can do that easily with Brew:

`$ brew cask install chromedriver`

### <a id="existingproject"> As a module in your existing project:

1. Add the module to your project

    `npm install --save-dev nav-ally`

2. Create a Yaml-based definition file and add it anywhere in your project (preferably on the root folder):

    Paste in the following example content in a file called wcag.yml:

    ```yaml
    links:
     - "http://google.com"
    ```

3. Create a run script in your package.json:

    "wcag-test":"nav-ally -f wcag.yml"

    This will tell NAV-Ally to use the file called "wcag.yml". Validation will fail on any violation. If you want to allow _up to x errors_ , add the -M flag (not recommended):

    "wcag-test":"nav-ally -M 3 -f wcag.yml"

4. You can now run the validator:

    `$ npm run wcag-test`

### <a id="cli"> Command line arguments

|Argument|Description|
|--------|-----------|
|  -V, --version|                 output the version number  |
|  -f, --definition-file <path>|  set definition file  |
|  --headless <value>|            run in headless mode (default: "yes") |
|  -r, --detailed-report |        print a detailed report  |
|  -d, --debug-info   |           prints out debug info to console if set |
|  -w, --warnings       |         validation fails on warnings too if set |
|  -M, --max-errors <value> |     accept up "M" number of errors  |
|  -h, --help |                   output usage information  |

You can specify single letter args (those without values) together. For example to enable detailed report, debug info and fail on warnings:

    "wcag-test":"nav-ally -drw -f wcag.yml"


    ### <a id="standalone"> Running NAV-Ally standalone

    1. Install NAV-Ally globally from  NPM:

    `$ npm install -g nav-ally`

    2. Run the following command to run the validator with a given definition file:

        `$ nav-ally -f wcag.yml`
