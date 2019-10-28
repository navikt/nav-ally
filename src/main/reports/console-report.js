function printNodes(nodeCount, nodes) {
  for (let j = 0; j < nodeCount; j += 1) {
    const node = nodes[j];

    if (typeof node !== 'undefined') {
      console.log('\tHTML Element: ' + node.html);
      const anys = node.any;
      const targets = node.target;

      if (typeof anys !== 'undefined') {
        for (let k = 0; k < anys.length; k += 1) {
          const displayNumber = k + 1;
          const any = anys[k];
          console.log('\tMessage ' + displayNumber + ': ' + any.message);
        }
      }

      if (typeof targets !== 'undefined') {
        const targetCount = targets.length;

        for (let k = 0; k < targetCount; k += 1) {
          const target = targets[k];
          console.log('\tDOM Element: ' + target);
        }
      }
      console.log('\n');
    }
  }
}

function print(violations, url, type, detailedReport) {
  printLine();

  const typeCaption = type ? 'violation' : 'warning';
  const typeCaptions = type ? 'violations' : 'warnings';
  const violationCount = violations.length;
  let statCount = 0;

  violations.forEach(violation => (statCount += violation.nodes.length));

  if (violationCount > 0) {
    violationCount > 1
      ? console.log(
          'There are ' + statCount + ' ' + typeCaptions + ' on URL: ' + url
        )
      : console.log('There is one ' + typeCaption + ' on URL: ' + url);
    printEmptyLine();

    for (let i = 0; i < violationCount; i += 1) {
      const violation = violations[i];
      const nodes = violation.nodes;

      if (typeof nodes !== 'undefined') {
        const nodeCount = nodes.length;

        nodeCount > 1
          ? console.log(
              '    - ' +
                nodeCount +
                ' instances of the following ' +
                typeCaption +
                ' type: ' +
                violation.id
            )
          : console.log(
              '    - 1 instance of the following ' +
                typeCaption +
                ' type: ' +
                violation.id
            );

        if (detailedReport) {
          printNodes(nodeCount, nodes);
          printEmptyLine();
        }
      }
    }

    printEmptyLine();
    console.log('End of ' + typeCaptions + ' on: ' + url);
    printLine();
  } else {
    console.log('No ' + typeCaptions + ' found on: ' + url);
    printLine();
  }
}

function printLine() {
  console.log(
    '--------------------------------------------------------------------------------'
  );
}

function printEmptyLine() {
  console.log('');
}

exports.printReport = function(results, desc, detailedReport) {
  const url = desc || results.url;

  const violations = results.violations;
  if (typeof violations !== 'undefined') {
    print(violations, url, true, detailedReport);
  }

  console.log();

  const incomplete = results.incomplete;
  if (typeof incomplete !== 'undefined') {
    print(incomplete, url, false, detailedReport);
  }
};
