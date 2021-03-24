---
layout: default
title: Global configuration
nav_order: 3
description: "Settings and environment variables."
has_children: true
---

# On this page:
- [Global configuration](#configuration)
- [Validation rules](#validation_rules)
- [Test execution and assertation](#test_execution_and_assertation)

## <a id="configuration"> Global configuration
You can configure the tool with the following global variables. The variables can be exported or configured from the commandline or through the system environment.

|Name|Type|Default Value|Required|Description|
|----|----|-------------|--------|-----------|
|CHROME_BIN|`string`||Only on Linux|Chrome browser binary file path. Only needed on Linux/Unix systems|
|FIREFOX_BIN|`string`||Only on Linux|Firefox browser binary file path. Only needed on Linux/Unix systems|
|BROWSER|`string`|chrome|No|Default browser to test when it's not defined in the definition file. Can be overridden pr link.|
|HEADLESS|`boolean`|true|No|If set to `true` the browser runs in headless mode.|

### <a id="validation_rules"> Validation rules
|Name|Type|Default Value|Required|Description|
|----|----|-------------|--------|-----------|
|DEFINITION_FILE|`string`||Yes|File path to a Yaml or Javascript definition file. NAV-Ally will try to load a definition file from this property if it cannot find a input file given with the `-f` flag. This can useful if NAV-Ally is run standalone in a build server.|
|TAGS|`string`|**See below|No|Which rules and/or categories should the validator apply as default. Can be overridden on a link in the definition file.|

#### <a id="axe_tags">**All the accessibility rule groups / categories available in Axe:
wcag2a,wcag2aa,wcag2aaa,section508,best-practice,experimental,cat.aria,cat.color,cat.text-alternatives,cat.time-and-media,cat.tables,
cat.semantics,cat.sensory-and-visual-cues,cat.parsing,cat.structure,cat.name-role-value,cat.keyboard,cat.forms,cat.language

#### All accessibility rules supported by Axe:

https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md

### <a id="test_execution_and_assertation"> Test execution and assertion
|Name|Type|Default Value|Required|Description|
|----|----|-------------|--------|-----------|
|NAME|`string`|UU Test|No|The test execution title|
|DETAILED_REPORT|`boolean`|true|No|If set to `false` will print out only a summary.|
|ASSERT_WARNINGS|`boolean`|false|No|If set to `true` will also trigger assertation on warnings (that is, violations that need review).|
|TIMEOUT|`integer`|300000|No|Browser script timeout|
<br />
