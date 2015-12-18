'use strict';
module.exports = function (grunt) {
    require('./grunttasks/clean.task.js')(grunt);
    require('./grunttasks/eslint.task.js')(grunt);
    require('./grunttasks/coverage.task.js')(grunt);
    require('./grunttasks/mocha.task.js')(grunt);
    require('./grunttasks/browserify.task.js')(grunt);
    require('./grunttasks/uglify.task.js')(grunt);

    grunt.registerTask('test', ['clean:test', 'eslint', 'coveredMocha']);
    grunt.registerTask('build', ['clean:dist', 'browserify:build', 'uglify:build']);
};
