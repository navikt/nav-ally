# 1.4.0 / 2019-07-08

## :nut_and_bolt: Other

- Upgraded and reduced deps
- Fixed security issues
- Updated documentation
- Fixed cli flags: r, d and w flags doesn't require a value anymore. If one they are on the command line, they will be activated.
- The "hidden-content" rule is now disabled by default. Add an empty _ignoreRules_ option to your definition file to activate it.

# 1.3.1 / 2019-05-31

## :tada: Enhancements

- Added support for specifying maximum number of errors. You can now add -M \<x\> flag to accept up to x errors.

## :nut_and_bolt: Other

- Upgraded deps
- Refactored the validator code

# 1.2.0 / 2019-01-21

## :tada: Enhancements

- Updated the [Docker image](docker/Dockerfile) so it uses chromium-chromedriver from Alpine repos instead of chromedriver.js from NPM.


# 1.1.0 / 2018-12-07

## :tada: Enhancements

- Complete rewrite of the MochaRunner. It now allows to run validation with a definition given as a method parameter.
Also added a Dockerfile and added an initial support to allow the use of "maximum number of fails" assertion.

## :bug: Fixes

- Fixed a bug that counted incorrect number of warnings.

## :nut_and_bolt: Other

- Firefox driver is no longer automatically downloaded. The validator will automatically load the drivers
when it is installed in your own project.
- Added support for loading test suites used to test the validator itself.

# 1.0.3 / 2018-11-20

## :tada: Enhancements

- NAV-Ally is published to npmjs. You can now test any project by just installing the module to your project.

## :book: Documentation

- Added a complete example application that shows how to starts a local instance of an application be running the validator. [exampleapp]
- Published an initial template for a website: [docwebsite]

## :nut_and_bolt: Other

- Major clean up of the repository

[exampleapp]: https://github.com/dervism/carparkjs
[docwebsite]: https://navikt.github.io/nav-ally/

# 0.10.0 / 2018-05-18

## :tada: Enhancements

- [#3]: First release ([@dervism]). You can now run the validator from the cli:  
node bin/validator -f ./src/test/definitions/nav.yml -r false (-r: detailed report option)

## :bug: Fixes

## :book: Documentation

## :nut_and_bolt: Other


[@dervism]: https://github.com/dervism
