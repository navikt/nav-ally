'use strict';

module.exports = {
  scripts: {
    lint: {
      default: {
        script: 'nps lint.code',
        description: 'Lint code and Markdown documentation'
      },
      code: {
        script: 'eslint "./src/**/*" "bin/*"',
        description: 'Run ESLint linter'
      },
      codefix: {
          script: 'eslint "./src/**/*" "bin/*" --fix',
          description: 'Run ESLint linter with fix'
      },
      markdown: {
        script: 'markdownlint "*.md" "docs/**/*.md" ".github/*.md"',
        description: 'Run markdownlint linter'
      }
    },
    reformat: {
      script:
        'prettier-eslint --write "*.js" "src/**/*.js" "bin/*" "scripts/*"',
      description: 'Reformat codebase with Prettier'
    },
    docs: {
      default: {
        script:
          'nps docs.prebuild && bundle exec jekyll build --source ./docs --destination ./docs/_site --config ./docs/_config.yml --safe --drafts',
        description: 'Build documentation'
      },
      prebuild: {
        script:
          'rimraf docs/_site docs/api && nps docs.api',
        description: 'Prepare system for doc building',
        hiddenFromHelp: true
      },
      api: {
        script:
          'mkdirp docs/api && jsdoc -c jsdoc.conf.json && cp LICENSE docs/api',
        description: 'build api docs'
      }
    }
  }
};
