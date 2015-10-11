/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var chai = require('chai');
var extenderHelperModule = require('../../../src/helper/extenderhelper.js');

describe('Extender helper', function () {
    var observable;
    var scope;
    var fakeYal;
    
    beforeEach(function () {
        observable = {};
        scope = {};
        fakeYal = {};
    });
    
    it('should have a function that is named "registerExtenders" that expects 2 params', function () {
        extenderHelperModule(fakeYal);
        
        expect(fakeYal.registerExtender).to.be.a('function');
        expect(fakeYal.registerExtender.length).to.equal(2);
    });
    
    it('should have a function that is named "extendWithExtender" that expects 2 params', function () {
        extenderHelperModule(fakeYal);
        
        expect(fakeYal.extendWithExtender).to.be.a('function');
        expect(fakeYal.extendWithExtender.length).to.equal(2);
    });
    
    [3.14, -2.7, 0, 1, true, false, null, undefined, function () { }, [], {}].forEach(function (aParam) {
        it('should throw when invoking with wrong parameters(first parameter ' + toString.call(aParam) + ')', function () {
            extenderHelperModule(fakeYal);

            function registerExtender() {
                fakeYal.registerExtender(aParam, function () { });
            }
            
            expect(registerExtender).to.throw(TypeError);
            expect(registerExtender).to.throw(/^yal registerExtender:/);
        });
    });
    
    [3.14, -2.7, 0, 1, true, false, null, undefined, 'test', [], {}].forEach(function (aParam) {
        it('should throw when invoking with wrong parameters(second parameter ' + toString.call(aParam) + ')', function () {
            extenderHelperModule(fakeYal);

            function registerExtender() {
                fakeYal.registerExtender('extender', aParam);
            }
            
            expect(registerExtender).to.throw(TypeError);
            expect(registerExtender).to.throw(/^yal registerExtender:/);
        });
    });
    
    it('should not throw when invoking with correct parameters', function () {
        extenderHelperModule(fakeYal);
        
        function registerExtender() {
            fakeYal.registerExtender('extender', function () { });
        }
            
        expect(registerExtender).not.to.throw();
    });
    
    it('should write the extender to the private registered extender list', function () {
        extenderHelperModule(fakeYal, true);
        
        var name = 'extender';
        var extender = chai.spy();
        
        fakeYal.registerExtender(name, extender);
        
        var keys = Object.keys(fakeYal.registeredExtenders);
        
        expect(keys.length).to.equal(1);
        expect(keys[0]).to.equal(name);
        expect(fakeYal.registeredExtenders[name]).to.equal(extender);
    });
    
    it('should extend the observable to extend by one function', function () {
        extenderHelperModule(fakeYal);
        
        var observableKeys = Object.keys(observable);
        var scopeKeys = Object.keys(scope);
        
        expect(observableKeys.length).to.equal(0);
        expect(scopeKeys.length).to.equal(0);
        
        fakeYal.extendWithExtender(observable, scope);
        
        observableKeys = Object.keys(observable);
        scopeKeys = Object.keys(scope);
        
        expect(observableKeys.length).to.equal(1);
        expect(scopeKeys.length).to.equal(0);
    });
    
    it('should extend the observable to extend by a function called "extend"', function () {
        extenderHelperModule(fakeYal);
        
        fakeYal.extendWithExtender(observable, scope);
        
        expect(observable.extend).to.be.a('function');
    });
    
    [3.14, -2.7, 0, 1, true, false, 'test', function () { }, [], null, undefined].forEach(function (aParam) {
        it('should throw an error calling the extend function with a wrong typed parameter ' + toString.call(aParam), function () {
            extenderHelperModule(fakeYal);
            
            fakeYal.extendWithExtender(observable, scope);
            
            function doExtend() {
                observable.extend(aParam);
            }
            
            expect(doExtend).to.throw(TypeError);
            expect(doExtend).to.throw(/^yal extend:/);
        });
    });
    
    it('should throw an error calling a unknown extender', function () {
        extenderHelperModule(fakeYal);
        
        fakeYal.extendWithExtender(observable, scope);
        
        function doExtend() {
            observable.extend({
                unkown: true
            });
        }
        
        expect(doExtend).to.throw(TypeError);
        expect(doExtend).to.throw(/^yal extend:/);
    });
    
    it('should call the extender function with the correct parameters', function () {
        extenderHelperModule(fakeYal);
        
        var extender = chai.spy();
        var spyParameters = {};
        
        fakeYal.registerExtender('spy', extender);
        fakeYal.extendWithExtender(observable, scope);
        
        expect(extender).not.to.have.been.called();
        
        function doExtend() {
            observable.extend({
                spy: spyParameters
            });
        }
        
        expect(doExtend).not.to.throw();
        
        var args = extender.__spy.calls[0];
        
        expect(extender).to.have.been.called.once();
        expect(args.length).to.equal(3);
        expect(args[0]).to.equal(observable);
        expect(args[1]).to.equal(scope);
        expect(args[2]).to.equal(spyParameters);
    });
    
    it('should return the observable itself calling the extend function', function () {
        extenderHelperModule(fakeYal);
        fakeYal.extendWithExtender(observable, scope);
        
        expect(observable.extend({})).to.equal(observable);
    });
});