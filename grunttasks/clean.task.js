'use strict';
module.exports = function (grunt) {
    grunt.config('clean', {
        test: ['test/results'],
        dist: ['dist/']
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
};