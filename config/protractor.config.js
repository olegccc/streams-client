exports.config = {
    verbose: true,
    capabilities: {
        browserName: 'phantomjs',
        'phantomjs.binary.path': require('phantomjs').path,
        'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
    }
};
