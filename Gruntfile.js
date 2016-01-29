module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jade');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-sync');

    grunt.config.init(grunt.file.readJSON('config/build.config.json'));

    grunt.task.loadTasks('grunt-tasks');

    var configureMiddleware = require('./grunt-modules/configureMiddleware');
    configureMiddleware(grunt, 'connect', null, 'src/index.jade');

    grunt.event.once('connect.examples.listening', function(host, port) {
        var url = 'http://localhost:' + port;
        require('open')(url);
    });

    grunt.registerTask('refresh-build', [
        'build-functional-specs',
        'wrap-jade',
        'ts:build',
        'jade:tests',
        'sync:build'
    ]);

    grunt.registerTask('build', [
        'clean:build',
        'refresh-build',
        'karma:build',
        'wrap-module',
        'uglify'
    ]);

    grunt.registerTask('view', ['connect:keepalive']);

    grunt.registerTask('functional-tests', ['download-selenium-webdriver', 'run-functional-tests']);
};
