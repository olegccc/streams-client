module.exports = function(grunt) {

    var fs = require('fs');
    var path = require('path');

    grunt.registerTask('initialize-functional-test', function(testPath) {
        var config = grunt.config('run-functional-tests');

        var initializePath = path.resolve(config.path, testPath, config.initialize);

        var initialize = require(initializePath);

        if (initialize.initialize) {
            initialize.initialize();
        }
    });

    grunt.registerTask('finalize-functional-test', function(testPath) {
        var config = grunt.config('run-functional-tests');

        var initializePath = path.resolve(config.path, testPath, config.initialize);

        var initialize = require(initializePath);

        if (initialize.finalize) {
            initialize.finalize();
        }
    });

    grunt.registerTask('run-functional-test', function(testPath) {

        var config = grunt.config('run-functional-tests');

        var args = grunt.config('protractor.options.args');
        args.specs = [path.join(config.path, testPath, config.mask)];

        grunt.config('protractor.' + testPath, {
            options: {
                args: args
            }
        });

        grunt.task.run([
            'initialize-functional-test:' + testPath,
            'protractor:' + testPath,
            'finalize-functional-test:' + testPath]);
    });

    grunt.registerTask('run-functional-tests', function() {
        var done = this.async();
        var config = grunt.config('run-functional-tests');
        var tasks = [];
        grunt.log.debug('Scanning dir ' + config.path);
        fs.readdir(config.path, function(err, files) {
            if (err) {
                grunt.log.error(err);
                done();
                return;
            }

            files.forEach(function(testPath) {
                tasks.push('run-functional-test:' + testPath);
            });

            grunt.task.run(tasks);
            done();
        });
    });

};