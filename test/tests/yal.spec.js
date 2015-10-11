/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var index = require('../../src/yal.js');

describe('index', function () {
    it('should be an object', function () {
        expect(index).to.be.an('object');
    });
});