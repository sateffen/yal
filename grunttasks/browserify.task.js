'use strict';
module.exports = function (grunt) {
    grunt.config('browserify', {
        options: {
            browserifyOptions: {
                standalone: 'yal'
            }
        },
        build: {
            files: {
                'dist/yal.js': ['./src/yal.js']
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-browserify');
};