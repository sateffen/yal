/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var chai = require('chai');
var observableModule = require('../../../src/subscribable/observable.js');

describe('Observable', function () {
    var fakeYal;
    
    beforeEach(function resetFakeYalSpies() {
        fakeYal = {
            unpack: chai.spy(),
            extendWithSubscribable: chai.spy(),
            extendWithExtender: chai.spy()
        };
    });
    
    it('should be a function as module', function () {
        expect(observableModule).to.be.a('function');
    });
    
    it('should apply a function called "observable" to the target', function () {
        expect(fakeYal.observable).to.equal(undefined);
        
        observableModule(fakeYal);
        
        expect(fakeYal.observable).be.a('function');
    });
    
    it('should not have called any yal functions when applying', function () {
        observableModule(fakeYal);
        
        expect(fakeYal.unpack).to.not.have.been.called();
        expect(fakeYal.extendWithExtender).to.not.have.been.called();
        expect(fakeYal.extendWithSubscribable).to.not.have.been.called();
    });
    
    it('should create a function calling the y.observable function', function () {
        observableModule(fakeYal);
        var observable = fakeYal.observable();
        
        expect(observable).to.be.a('function');
    });
    
    it('should return the initial value on calling', function () {
        observableModule(fakeYal);
        var observable = fakeYal.observable(Math.PI);
        
        expect(observable()).to.equal(Math.PI);
    });
    
    it('should remember the lastest written value', function () {
        observableModule(fakeYal);
        var observable = fakeYal.observable(Math.PI);
        
        observable.valueHasMutated = function () {};
        
        expect(observable()).to.equal(Math.PI);
        
        observable('hello world');
        
        expect(observable()).to.equal('hello world');
    });
    
    it('should call the valueHasMutated function when the value changes', function () {
        observableModule(fakeYal);
        var observable = fakeYal.observable(Math.PI);
        
        observable.valueHasMutated = chai.spy();
        observable('hello world');
        
        expect(observable.valueHasMutated).to.have.been.called();
    });
    
    it('should call the y.unpack function whenever a observable is created, with the observable itself as argument', function () {
        observableModule(fakeYal);
        var observable = fakeYal.observable(Math.PI);
        
        expect(fakeYal.unpack).to.not.have.been.called();
        observable();
        
        expect(fakeYal.unpack).to.have.been.called();
        expect(fakeYal.unpack).to.have.been.called.with(observable, true);
    });
    
    it('should call the y.extendWithExtender function whenever a observable is created, with the observable and it\'s inner scope as arguments', function () {
        observableModule(fakeYal, true);
        expect(fakeYal.extendWithExtender).to.not.have.been.called();
        
        var observable = fakeYal.observable(Math.PI);
        
        expect(fakeYal.extendWithExtender).to.have.been.called.once();
        
        var callArgs = fakeYal.extendWithSubscribable.__spy.calls[0];
        
        expect(callArgs[0]).to.equal(observable);
        expect(callArgs[1]).to.equal(observable.__scope__);
    });
    
    it('should call the y.extendWithSubscribable function whenever a observable is created, with the observable and it\'s inner scope as arguments', function () {
        observableModule(fakeYal, true);
        expect(fakeYal.extendWithSubscribable).to.not.have.been.called();
        
        var observable = fakeYal.observable(Math.PI);
        
        expect(fakeYal.extendWithSubscribable).to.have.been.called.once();
        
        var callArgs = fakeYal.extendWithSubscribable.__spy.calls[0];
        
        expect(callArgs[0]).to.equal(observable);
        expect(callArgs[1]).to.equal(observable.__scope__);
    });
});