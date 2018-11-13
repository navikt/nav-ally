#!/bin/bash
set -e

##
## This script is designed to make it easier to start the validator with
## default settings set through the command line interface. The script
## allows you to run the validator directly from any folder. To make it
## work simply create an alias:
##
## $ ~/.bashrc << alias uuvalidator="/path/to/uu-validator-repo/run.sh" && source ~/.bashrc
##

declare FILE

WORKDIR=$(dirname $0)

if [ -r "uu-definisjon.yml" ] && [ -z "$DEFINITION_FILE" ] && [ -z "$1" ]; then
    FILE=./uu-definisjon.yml
    echo "Using definition file in workdir: $FILE."
else
    # env var and script argument is not set
    # try to locate the definition file from workdir
    if [ -z "$DEFINITION_FILE" ] && [ -z "$1" ]; then
        echo "No definition file specified. You have to set the DEFINITION_FILE environment variable or specify file path as argument."
        exit 1

    # env var is not set, but script argument is set
    elif [ -n "$1" ] && [ -z "$DEFINITION_FILE" ]; then
        FILE=$(realpath $1)
        echo "Using definition file from input argument: $FILE."

    # env var is set and script argument is not set
    # try to locate the definition file from the env var
    elif [ -n $DEFINITION_FILE ] && [ -z "$1" ]; then
        FILE=$(realpath $DEFINITION_FILE)
        echo "Using definition file from environment variable: $DEFINITION_FILE"
    fi
fi

# Print debug info to console
declare REPORT=$( test -z "$DETAILED_REPORT" && echo "true (default)" || echo "$DETAILED_REPORT")
declare WARNINGS=$( test -z "$ASSERT_WARNINGS" && echo "false (default)" || echo "$ASSERT_WARNINGS")
declare HEADLESS=$( test -z "$HEADLESS" && echo "true (default)" || echo "$HEADLESS")
declare BROWSER=$( test -z "$BROWSER" && echo "chrome (default)" || echo "$BROWSER")
declare TIMEOUT=$( test -z "$TIMEOUT" && echo "30000 (default)" || echo "$TIMEOUT")
declare WAIT_TIMEOUT=$( test -z "$WAIT_TIMEOUT" && echo "30000 (default)" || echo "$WAIT_TIMEOUT")
declare CHROME_BINARY=$( test -z "$CHROME_BINARY" && echo "Not set" || echo "$CHROME_BINARY")
declare FIREFOX_BINARY=$( test -z "$FIREFOX_BINARY" && echo "Not set" || echo "$FIREFOX_BINARY")
declare REUSE_BROWSERS=$( test -z "$REUSE_BROWSERS" && echo "false (default)" || echo "$REUSE_BROWSERS")
echo "DEFINITION_FILE: $FILE"
echo "DETAILED_REPORT: $REPORT"
echo "ASSERT_WARNINGS: $WARNINGS"
echo "HEADLESS: $HEADLESS"
echo "BROWSER: $BROWSER"
echo "TIMEOUT: $TIMEOUT"
echo "WAIT_TIMEOUT: $WAIT_TIMEOUT"
echo "CHROME_BINARY: $CHROME_BINARY"
echo "FIREFOX_BINARY: $FIREFOX_BINARY"
echo "REUSE_BROWSERS: $REUSE_BROWSERS"

# if the input file exists and is readable
if [ -r "$FILE" ]; then
    # run the validator with the given definition file
    export DEFINITION_FILE="$FILE"
    cd $WORKDIR && npm run start
else
    echo "Could not find definition file $FILE"
    exit 1
fi
