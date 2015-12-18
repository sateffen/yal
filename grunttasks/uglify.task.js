'use strict';
module.exports = function (grunt) {
    grunt.config('uglify', {
        options: {
            screwIE8: true,
            preserveComments: false
        },
        build: {
            files: {
                'dist/yal.min.js': ['dist/yal.js']
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-uglify');
};