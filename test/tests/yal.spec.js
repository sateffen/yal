/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var yal = require('../../src/yal.js');

describe('integration', function () {
    it('should be an object', function () {
        expect(yal).to.be.an('object');
    });
    
    it('should call the computed when updating the observable', function () {
        var executedComputed = false;
        var observable = yal.observable(1);
        var computed = yal.computed(function () {
            executedComputed = true;
            var toDouble = yal.unwrap(observable);
            
            return toDouble * 2;
        });
        
        expect(executedComputed).to.equal(true);
        expect(observable()).to.equal(1);
        expect(computed()).to.equal(2);
        
        executedComputed = false;
        observable(2);
        
        expect(executedComputed).to.equal(true);
        expect(observable()).to.equal(2);
        expect(computed()).to.equal(4);
    });
});