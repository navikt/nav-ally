exports.links = [
    {link: 'http://localhost:3000/lorem/ipsum',
        options: {
            commands: [
                { waitFor: '.lorem-page' },
                { waitFor: '.ipsum-content' },
                { clickAndWait: {clickOn: '#menuItem + label', thenWaitFor: '.result-table' } }
            ]
        }
    },
    {link: 'http://localhost:3000/dolor/sit/amet'}
];
