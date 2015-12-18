'use strict';
module.exports = function (grunt) {
    var path = require('path');
    var istanbul = require('istanbul');

    grunt.registerTask('startCoverageCollection', '', function () {
        var srcDir = path.resolve(__dirname, '../src');
        var instrumenter = new istanbul.Instrumenter();

        function matcher(aFileName) {
            return path.resolve(aFileName).indexOf(srcDir) > -1;
        }

        istanbul.hook.hookRequire(matcher, instrumenter.instrumentSync.bind(instrumenter));
    });

    grunt.registerTask('stopCoverageCollection', function () {
        istanbul.hook.unhookRequire();
        var targetDirectory = path.resolve(__dirname, '../test/results');
        var collector = new istanbul.Collector();

        collector.add(global.__coverage__);

        // and finally generate the report
        istanbul.Report
            .create('lcov', {
                dir: targetDirectory
            })
        // but do it sync (second param)
            .writeReport(collector, true);
    });
};