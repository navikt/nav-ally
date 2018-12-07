# 1.1.0 / 2018-12-07

## :tada: Enhancements

- Complete rewrite of the MochaRunner. It now allows to run validation with a definition given as a method parameter. 
Also added a Dockerfile and added an initial support to allow the use of "maximum number of fails" assertion.

## :bug: Fixes

- Fixed a bug that counted incorrect number of warnings.

## :book: Documentation

## :nut_and_bolt: Other

- Firefox driver is no longer automatically downloaded. The validator will automatically load the drivers 
when it is installed in your own project.

# 1.0.3 / 2018-11-20

## :tada: Enhancements

- NAV-Ally is published to npmjs. You can now test any project by just installing the module to your project.

## :bug: Fixes

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