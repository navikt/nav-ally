const Handlebars = require('handlebars');
const jsdom = require('jsdom');
const fs = require('fs');
const path = require('path');
const {JSDOM} = jsdom;

const filePath = path.join(__dirname, 'html-template.html');
const source = fs.readFileSync(filePath, 'utf8').toString();

const dom = new JSDOM(source);
const {document} = dom.window;

const pageListTemplate = document.getElementById('pageListTemplate');
const tableTemplate = document.getElementById('tableTemplate');
const rowTemplate = document.getElementById('rowTemplate');
const relatedListTemplate = document.getElementById('relatedListTemplate');
const relatedNodeTemplate = document.getElementById('relatedNodeTemplate');
const failureTemplate = document.getElementById('failureTemplate');
const reasonsTemplate = document.getElementById('reasonsTemplate');

const compiledPageListTemplate = Handlebars.compile(pageListTemplate.innerHTML);
const compiledTableTemplate = Handlebars.compile(tableTemplate.innerHTML);
const compiledRowTemplate = Handlebars.compile(rowTemplate.innerHTML);
const compiledRelatedListTemplate = Handlebars.compile(
  relatedListTemplate.innerHTML
);
const compiledRelatedNodeTemplate = Handlebars.compile(
  relatedNodeTemplate.innerHTML
);
const compiledFailureTemplate = Handlebars.compile(failureTemplate.innerHTML);
const compiledReasonsTemplate = Handlebars.compile(reasonsTemplate.innerHTML);

Handlebars.registerHelper('pages', function(items) {
  return helperItemIterator(items, compiledTableTemplate);
});
Handlebars.registerHelper('violations', function(items) {
  return helperItemIterator(items, compiledRowTemplate);
});
Handlebars.registerHelper('related', function(items) {
  return helperItemIterator(items, compiledRelatedNodeTemplate);
});
Handlebars.registerHelper('reasons', function(items) {
  return helperItemIterator(items, compiledFailureTemplate);
});

function helperItemIterator(items, template) {
  let out = '';
  if (items) {
    for (let i = 0; i < items.length; i++) {
      out += template(items[i]);
    }
  }
  return out;
}

function summary(node) {
  let retVal = '';
  if (node.any.length) {
    retVal += '<h3 class="error-title">Fix any of the following</h3>';
    retVal += messagesFromArray(node.any);
  }

  const all = node.all.concat(node.none);
  if (all.length) {
    retVal += '<h3 class="error-title">Fix all of the following</h3>';
    retVal += messagesFromArray(all);
  }
  return retVal;
}

function messagesFromArray(nodes) {
  const list = nodes.map(function(failure) {
    return {
      message: failure.message,
      relatedNodesMessage: messageFromRelatedNodes(failure.relatedNodes)
    };
  });
  return compiledReasonsTemplate({reasonsList: list});
}

function messageFromRelatedNodes(relatedNodes) {
  let retVal = '';
  if (relatedNodes.length) {
    const list = relatedNodes.map(function(node) {
      return {
        targetArrayString: JSON.stringify(node.target),
        targetString: node.target.join(' ')
      };
    });
    retVal += compiledRelatedListTemplate({relatedNodeList: list});
  }
  return retVal;
}

/*
 * This code will generate a table of the rules that failed including counts and links to the Deque University help
 * for each rule.
 *
 * When used, you should attach click handlers to the anchors in order to generate the details for each of the
 * violations for each rule.
 */

exports.printReport = function generateHTML(results, filename) {
  const pageList = [];

  results.forEach(function(page) {
    if (page.result.violations.length) {
      const violations = page.result.violations.map(function(rule, i) {
        return {
          impact: rule.impact,
          help: rule.help,
          bestpractice: rule.tags.indexOf('best-practice') !== -1,
          helpUrl: rule.helpUrl,
          count: rule.nodes.length,
          index: i,
          reason: getReasons(rule.nodes)
        };
      });

      pageList.push({
        pageDescOrUrl: page.desc || page.link || page.url,
        violationList: violations
      });
    }
  });

  document.getElementById('reportSection').innerHTML = compiledPageListTemplate(
    {pageList: pageList}
  );
  const data = dom.serialize();

  fs.writeFile(
    path.join(__dirname, filename + '-report.html'),
    data,
    'utf8',
    err => {
      if (err) throw err;
      console.log('The file has been saved!');
    }
  );
};

function getReasons(nodes) {
  const rs = [];
  nodes.forEach(node => {
    rs.push(summary(node));
  });
  return rs;
}

/*
 * To generate the human readable summary, call the `summary` function with the node. This will return HTML for that node.
 */

// reasonHtml = summary(node);
