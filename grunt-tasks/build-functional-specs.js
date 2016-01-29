module.exports = function(grunt) {

    grunt.registerTask('build-functional-specs', function() {
        var done = this.async();

        var fs = require('fs');
        var path = require('path');
        var config = grunt.config('run-functional-tests');

        grunt.log.debug('Scanning dir ' + config.path);

        fs.readdir(config.src, function(err, files) {
            if (err) {
                grunt.log.error(err);
                done();
                return;
            }

            var configFiles = grunt.config("ts.build.files");

            files.forEach(function(testPath) {
                configFiles[config.path + "/" + testPath + "/specs.js"] = [
                    "typings/tsd.d.ts",
                    config.src + "/" + testPath + "/**/*Spec.ts"
                ];
            });

            grunt.config("ts.build.files", configFiles);

            done();
        });
    });
};