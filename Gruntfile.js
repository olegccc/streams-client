module.exports = function (grunt) {
    var path = require('path');
    var fs = require('fs');

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-ts');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-protractor-runner');
    grunt.loadNpmTasks('grunt-karma');

    grunt.config.init(grunt.file.readJSON('config/build.config.json'));

    grunt.task.loadTasks('grunt-tasks');

    var configureMiddleware = require('./grunt-modules/configureMiddleware');
    configureMiddleware(grunt, 'connect', null, 'src/index.jade');

    grunt.event.once('connect.examples.listening', function(host, port) {
        var url = 'http://localhost:' + port;
        require('open')(url);
    });

    grunt.registerTask('release', [
        'clean:build',
        'wrap-jade',
        'ts:release',
        'karma:release',
        'wrap-module',
        'uglify',
        'copy:interfaces'
    ]);

    grunt.registerTask('view', ['connect:keepalive']);
};
