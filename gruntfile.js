module.exports = function (grunt) {
    'use strict';

    grunt.initConfig({
        clean: {
            test: ['test/results'],
            dist: ['dist/']
        },
        mochaTest: {
            default: {
                options: {
                    reporter: 'spec',
                    captureFile: 'test/results/result.txt',
                    require: [
                        'test/setup/blanket',
                        'test/setup/chai',
                        'test/setup/chaispies'
                    ]
                },
                src: ['./test/tests/**/*.js']
            },
            coverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: 'test/results/coverage.html'
                },
                src: ['test/tests/**/*.js']
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            target: ['./src/**/*.js', './test/**/*.js']
        },
        browserify: {
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
        },
        uglify: {
            options: {
                screwIE8: true,
                preserveComments: false
            },
            build: {
                files: {
                    'dist/yal.min.js': ['dist/yal.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-eslint');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('test', ['clean:test', 'eslint', 'mochaTest']);
    grunt.registerTask('build', ['clean:dist', 'browserify:build', 'uglify:build'])
};
