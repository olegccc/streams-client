module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-curl');

    var fs = require('fs');

    grunt.registerTask('download-selenium-webdriver', function() {
        var filePath = grunt.config('selenium_webdriver_file');

        var done = this.async();

        fs.exists(filePath, function(exists) {
            if (exists) {
                done();
                return;
            }

            var config = {};
            config[filePath] = grunt.config('selenium_webdriver_url');

            grunt.config('curl', config);
            grunt.task.run(['curl']);

            done();
        });
    });
};
