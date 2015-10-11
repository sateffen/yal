/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var chai = require('chai');
var dependencyHelperModule = require('../../../src/helper/dependencyhelper.js');

describe('Dependency helper', function () {
    var fakeYal;
    var isSubscribeableReturnValue;
    
    beforeEach(function () {
        fakeYal = {
            isSubscribable: function () {
                return isSubscribeableReturnValue;
            }
        };
        isSubscribeableReturnValue = false;
    });
    
    it('should have a function that is named "setupDependencyDetection" that expects 3 params', function () {
        dependencyHelperModule(fakeYal);
        
        expect(fakeYal.setupDependencyDetection).to.be.a('function');
        expect(fakeYal.setupDependencyDetection.length).to.equal(3);
    });
    
    it('should have a function that is named "tierDownDependencyDetection" that expects 1 params', function () {
        dependencyHelperModule(fakeYal);
        
        expect(fakeYal.tierDownDependencyDetection).to.be.a('function');
        expect(fakeYal.tierDownDependencyDetection.length).to.equal(1);
    });
    
    it('should have a function that is named "unwrap" that expects 1 params', function () {
        dependencyHelperModule(fakeYal);
        
        expect(fakeYal.unwrap).to.be.a('function');
        expect(fakeYal.unwrap.length).to.equal(1);
    });
    
    it('should have a function that is named "unpack" that expects up to 2 params', function () {
        dependencyHelperModule(fakeYal);
        
        expect(fakeYal.unpack).to.be.a('function');
        expect(fakeYal.unpack.length).to.equal(2);
    });
    
    it('should create an entry in "subscriptionCreationQueue" calling "setupDependencyDetection"', function () {
        dependencyHelperModule(fakeYal, true);
        
        expect(fakeYal.subscriptionCreationQueue.length).to.equal(0);
        
        fakeYal.setupDependencyDetection(chai.spy(), chai.spy(), false);
        
        expect(fakeYal.subscriptionCreationQueue.length).to.equal(1);
        
        fakeYal.setupDependencyDetection(chai.spy(), chai.spy(), true);
        
        expect(fakeYal.subscriptionCreationQueue.length).to.equal(2);
    });
    
    it('should write the the arguments to the object in the subscriptionCreationQueue', function () {
        dependencyHelperModule(fakeYal, true);
        var observable = chai.spy();
        var callbackFunction = chai.spy();
        
        // entry at 1
        fakeYal.setupDependencyDetection(callbackFunction, observable, true);
        // entry at 0
        fakeYal.setupDependencyDetection(observable, callbackFunction, false);
        // because the entries get shifted, not pushed
        
        expect(fakeYal.subscriptionCreationQueue[0].target).to.equal(observable);
        expect(fakeYal.subscriptionCreationQueue[0].callback).to.equal(callbackFunction);
        expect(fakeYal.subscriptionCreationQueue[0].isDeep).to.equal(false);
        expect(Array.isArray(fakeYal.subscriptionCreationQueue[0].disposables)).to.equal(true);
        expect(fakeYal.subscriptionCreationQueue[0].disposables.length).to.equal(0);
        
        expect(fakeYal.subscriptionCreationQueue[1].target).to.equal(callbackFunction);
        expect(fakeYal.subscriptionCreationQueue[1].callback).to.equal(observable);
        expect(fakeYal.subscriptionCreationQueue[1].isDeep).to.equal(true);
        expect(Array.isArray(fakeYal.subscriptionCreationQueue[1].disposables)).to.equal(true);
        expect(fakeYal.subscriptionCreationQueue[1].disposables.length).to.equal(0);
    });
    
    it('should return the value if calling "unwrap" and isSubscribeable returns false', function () {
        dependencyHelperModule(fakeYal);
        isSubscribeableReturnValue = false;
        
        var toUnwrap = {
            randV: Math.random()
        };
        
        expect(fakeYal.unwrap(toUnwrap)).to.equal(toUnwrap);
    });
    
    it('should return the value if calling "unwrap" and isSubscribeable returns true', function () {
        dependencyHelperModule(fakeYal);
        isSubscribeableReturnValue = true;
        
        var toUnwrap = {
            randV: Math.random()
        };
        
        function doUnwrap() {
            return toUnwrap;
        }
        
        expect(fakeYal.unwrap(doUnwrap)).to.equal(toUnwrap);
    });
    
    it('should add a subscriber so the current dependency detection', function () {
        dependencyHelperModule(fakeYal, true);
        isSubscribeableReturnValue = true;
        
        var observable = chai.spy();
        var callback = chai.spy();
        var subscribeReturn = Math.random();

        function toUnwrap() {
            return 3.14;
        }
        
        function subscribeFn() {
            return subscribeReturn;
        }
        
        toUnwrap.subscribe = subscribeFn;
        
        chai.spy.on(toUnwrap, 'subscribe');
        fakeYal.setupDependencyDetection(observable, callback, false);
        
        fakeYal.unwrap(toUnwrap);
        
        expect(toUnwrap.subscribe).to.have.been.called.once();
        expect(toUnwrap.subscribe).to.have.been.called.with(callback);
        expect(fakeYal.subscriptionCreationQueue[0].target).to.equal(observable);
        expect(fakeYal.subscriptionCreationQueue[0].callback).to.equal(callback);
        expect(Array.isArray(fakeYal.subscriptionCreationQueue[0].disposables)).to.equal(true);
        expect(fakeYal.subscriptionCreationQueue[0].disposables.length).to.equal(1);
        expect(fakeYal.subscriptionCreationQueue[0].disposables[0]).to.equal(subscribeReturn);
    });
    
    it('should return the value if calling "unpack" and isSubscribeable returns false', function () {
        dependencyHelperModule(fakeYal);
        isSubscribeableReturnValue = false;
        
        var toUnpack = {
            randV: Math.random()
        };
        
        expect(fakeYal.unpack(toUnpack)).to.equal(toUnpack);
    });
    
    it('should return the value if calling "unpack" and isSubscribeable returns true', function () {
        dependencyHelperModule(fakeYal);
        isSubscribeableReturnValue = true;
        
        var toUnpack = {
            randV: Math.random()
        };
        
        function doUnpack() {
            return toUnpack;
        }
        
        expect(fakeYal.unpack(doUnpack)).to.equal(toUnpack);
    });
    
    it('should add a subscriber so the current dependency detection calling "unpack" when the detecion is deep', function () {
        dependencyHelperModule(fakeYal, true);
        isSubscribeableReturnValue = true;
        
        var observable = chai.spy();
        var callback = chai.spy();
        var subscribeReturn = Math.random();

        function toUnpack() {
            return 3.14;
        }
        
        function subscribeFn() {
            return subscribeReturn;
        }
        
        toUnpack.subscribe = subscribeFn;
        
        chai.spy.on(toUnpack, 'subscribe');
        fakeYal.setupDependencyDetection(observable, callback, true);
        
        fakeYal.unpack(toUnpack);
        
        expect(toUnpack.subscribe).to.have.been.called.once();
        expect(toUnpack.subscribe).to.have.been.called.with(callback);
        expect(fakeYal.subscriptionCreationQueue[0].target).to.equal(observable);
        expect(fakeYal.subscriptionCreationQueue[0].callback).to.equal(callback);
        expect(Array.isArray(fakeYal.subscriptionCreationQueue[0].disposables)).to.equal(true);
        expect(fakeYal.subscriptionCreationQueue[0].disposables.length).to.equal(1);
        expect(fakeYal.subscriptionCreationQueue[0].disposables[0]).to.equal(subscribeReturn);
    });
    
    it('should not add a subscriber so the current dependency detection calling "unpack" when the detecion is not deep', function () {
        dependencyHelperModule(fakeYal, true);
        isSubscribeableReturnValue = true;
        
        var observable = chai.spy();
        var callback = chai.spy();
        var subscribeReturn = Math.random();

        function toUnpack() {
            return 3.14;
        }
        
        function subscribeFn() {
            return subscribeReturn;
        }
        
        toUnpack.subscribe = subscribeFn;
        
        chai.spy.on(toUnpack, 'subscribe');
        fakeYal.setupDependencyDetection(observable, callback, false);
        
        fakeYal.unpack(toUnpack);
        
        expect(toUnpack.subscribe).not.to.have.been.called();
        expect(fakeYal.subscriptionCreationQueue[0].disposables.length).to.equal(0);
    });
    
    it('should return the dependencies and tier down dependency detection when calling tierDownDependencyDetection', function () {
        dependencyHelperModule(fakeYal, true);
        isSubscribeableReturnValue = true;

        var observable = chai.spy();
        var callback = chai.spy();
        var dependencies;
        var disposableBySubscribeFn = Math.random();

        function toUnwrap() {
            return 3.14;
        }
        
        function subscribeFn() {
            return disposableBySubscribeFn;
        }
        
        function tierDown() {
            dependencies = fakeYal.tierDownDependencyDetection(observable);
        }
        
        toUnwrap.subscribe = subscribeFn;
        
        fakeYal.setupDependencyDetection(observable, callback, false);
        fakeYal.unwrap(toUnwrap);
        
        expect(tierDown).not.to.throw();
        
        // it should return an array
        expect(Array.isArray(dependencies)).to.equal(true);
        // containing one disposable
        expect(dependencies.length).to.equal(1);
        // and this disposable is the return value of the subscribe function from the toUnwrap
        expect(dependencies[0]).to.equal(disposableBySubscribeFn);
        // and the queue should be empty by now
        expect(fakeYal.subscriptionCreationQueue.length).to.equal(0);
    });
    
    it('should throw an error calling the tierDownDependencyDetection function with another than the current target', function () {
        dependencyHelperModule(fakeYal, true);

        var observable1 = chai.spy();
        var observable2 = chai.spy();
        var callback1 = chai.spy();
        var callback2 = chai.spy();
        
        function tierDown() {
            fakeYal.tierDownDependencyDetection(observable1);
        }
        
        fakeYal.setupDependencyDetection(observable1, callback1, false);
        fakeYal.setupDependencyDetection(observable2, callback2, false);
        // now observable2 is active

        expect(tierDown).to.throw(Error);
    });
    
    it('should throw an error calling the tierDownDependencyDetection when no detection is active', function () {
        dependencyHelperModule(fakeYal, true);
        
        function tierDown() {
            fakeYal.tierDownDependencyDetection(chai.spy());
        }
        
        expect(tierDown).to.throw(Error);
        expect(tierDown).to.throw(/^yal tierDownDependencyDetection:/);
    });
});