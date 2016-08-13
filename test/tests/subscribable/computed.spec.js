/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var chai = require('chai');
var computedModule = require('../../../src/subscribable/computed.js');

describe('Computed', function () {
    var fakeYal;

    beforeEach(function resetFakeYalSpies() {
        fakeYal = {
            unpack: chai.spy(),
            setupDependencyDetection: chai.spy(),
            tierDownDependencyDetection: chai.spy(function () {
                return [];
            }),
            extendWithSubscribable: chai.spy(function (aItem) {
                aItem.dispose = chai.spy();
            }),
            extendWithExtender: chai.spy()
        };
    });

    it('should be a function as module', function () {
        expect(computedModule).to.be.a('function');
    });

    it('should apply a function called "observable" to the target', function () {
        expect(fakeYal.computed).to.equal(undefined);

        computedModule(fakeYal);

        expect(fakeYal.computed).be.a('function');
    });

    it('should not have called any yal functions when applying', function () {
        computedModule(fakeYal);

        expect(fakeYal.unpack).to.not.have.been.called();
        expect(fakeYal.setupDependencyDetection).to.not.have.been.called();
        expect(fakeYal.tierDownDependencyDetection).to.not.have.been.called();
        expect(fakeYal.extendWithExtender).to.not.have.been.called();
        expect(fakeYal.extendWithSubscribable).to.not.have.been.called();
    });

    [true, false, null, undefined, 3.14, -2.7, 0, 1, 'test', {}, []].forEach(function (aType) {
        it('should throw an "yal computed" error initializing a computed with a value of type ' + toString.call(aType), function () {
            computedModule(fakeYal);

            function createComputed() {
                fakeYal.computed(aType);
            }

            expect(createComputed).to.throw(TypeError);
            expect(createComputed).to.throw(/yal computed:/);
        });
    });

    it('should not throw an "yal computed" error initializing a computed with a function as argument', function () {
        computedModule(fakeYal);

        function createComputed() {
            fakeYal.computed(function () { });
        }

        expect(createComputed).not.to.throw();
    });

    it('should call calculate an initial value when creating a computed', function () {
        computedModule(fakeYal);

        var calculateFunction = chai.spy();

        fakeYal.computed(calculateFunction);

        expect(calculateFunction).to.have.been.called();
    });

    it('should return the initially calculated value after creating a computed', function () {
        computedModule(fakeYal);

        var calculatedValue = Math.random().toString(26);

        function calculateFunction() {
            return calculatedValue;
        }

        var computed = fakeYal.computed(calculateFunction);

        expect(computed()).to.equal(calculatedValue);
    });

    it('should call the setup and tierdown function for dependency management on creation of computed', function () {
        computedModule(fakeYal);

        fakeYal.computed(function () { });

        expect(fakeYal.setupDependencyDetection).to.have.been.called();
        expect(fakeYal.tierDownDependencyDetection).to.have.been.called();
    });

    it('should call the setup dependency management function on creation of computed with the correct arguments', function () {
        computedModule(fakeYal, true);

        var computed = fakeYal.computed(function () { });

        expect(fakeYal.setupDependencyDetection).to.have.been.called.with(computed, computed.__scope__.recalculateValue);
    });

    it('should call the tierdown dependency management function on creation of computed with the correct arguments', function () {
        computedModule(fakeYal);

        var computed = fakeYal.computed(function () { });

        expect(fakeYal.tierDownDependencyDetection).to.have.been.called.with(computed);
    });

    it('should save the dependencies returned by the tierDownDependencyDetection function', function () {
        var returnValue = Math.random().toString(26);

        fakeYal.tierDownDependencyDetection = chai.spy(function () {
            return [returnValue];
        });

        computedModule(fakeYal, true);

        var computed = fakeYal.computed(function () { });

        expect(computed.__scope__.dependencies.length).to.equal(1);
        expect(computed.__scope__.dependencies[0]).to.equal(returnValue);
    });

    it('should call the y.extendWithExtender function whenever a computed is created, with the computeds and it\'s inner scope as arguments', function () {
        computedModule(fakeYal, true);
        expect(fakeYal.extendWithExtender).to.not.have.been.called();

        var computed = fakeYal.computed(function () { });

        expect(fakeYal.extendWithExtender).to.have.been.called.once();

        var callArgs = fakeYal.extendWithSubscribable.__spy.calls[0];

        expect(callArgs[0]).to.equal(computed);
        expect(callArgs[1]).to.equal(computed.__scope__);
    });

    it('should call the y.extendWithSubscribable function whenever a computed is created, with the computed and it\'s inner scope as arguments', function () {
        computedModule(fakeYal, true);
        expect(fakeYal.extendWithSubscribable).to.not.have.been.called();

        var computed = fakeYal.computed(function () { });

        expect(fakeYal.extendWithSubscribable).to.have.been.called.once();

        var callArgs = fakeYal.extendWithSubscribable.__spy.calls[0];

        expect(callArgs[0]).to.equal(computed);
        expect(callArgs[1]).to.equal(computed.__scope__);
    });

    it('should set a dirtyflag but not calculate a new value when there is no subscriber', function () {
        computedModule(fakeYal, true);

        var counter = 23;
        var calculateFunction = chai.spy(function () {
            return counter++;
        });
        var computed = fakeYal.computed(calculateFunction);

        // patch the scope with the "subscriptions" array, like the subscriptionshelper would do
        computed.__scope__.subscriptions = [];
        computed.valueHasMutated = function () { };

        expect(computed.__scope__.subscriptions.length).to.equal(0);
        expect(computed.__scope__.latestValue).to.equal(23);
        expect(calculateFunction).to.have.been.called.once();

        calculateFunction.reset();

        // simulate call to "recalculateValue", like when it's called by a dependency
        computed.__scope__.recalculateValue();

        expect(computed.__scope__.isDirty).to.equal(true);
        expect(computed.__scope__.latestValue).to.equal(23);
        expect(calculateFunction).not.to.have.been.called();
    });

    it('should reset a dirtyflag after calling the computed directly again', function () {
        computedModule(fakeYal, true);

        var counter = 32;
        var calculateFunction = chai.spy(function () {
            return counter++;
        });
        var computed = fakeYal.computed(calculateFunction);

        // patch the scope with the "subscriptions" array, like the subscriptionshelper would do
        computed.__scope__.subscriptions = [];
        computed.valueHasMutated = function () { };

        expect(computed.__scope__.subscriptions.length).to.equal(0);
        expect(computed.__scope__.latestValue).to.equal(32);
        expect(calculateFunction).to.have.been.called.once();

        calculateFunction.reset();

        // simulate call to "recalculateValue", like when it's called by a dependency
        computed.__scope__.recalculateValue();

        expect(computed.__scope__.isDirty).to.equal(true);
        expect(computed.__scope__.latestValue).to.equal(32);
        expect(calculateFunction).not.to.have.been.called();

        // now call the computed and trigger the recalculation
        expect(computed()).to.equal(33);
        expect(computed.__scope__.isDirty).to.equal(false);
        expect(computed.__scope__.latestValue).to.equal(33);
        expect(calculateFunction).to.have.been.called.once();
    });

    it('should not set the computed to be dirty if there are subscriptions', function () {
        computedModule(fakeYal, true);

        var counter = 42;
        var calculateFunction = chai.spy(function () {
            return counter++;
        });
        var computed = fakeYal.computed(calculateFunction);

        // patch the scope with the "subscriptions" array, like the subscriptionshelper would do
        computed.__scope__.subscriptions = [];
        computed.valueHasMutated = function () { };

        computed.__scope__.subscriptions.push(function () { });
        calculateFunction.reset();

        // simulate call to "recalculateValue", like when it's called by a dependency
        computed.__scope__.recalculateValue();

        expect(computed.__scope__.isDirty).to.equal(false);
        expect(computed.__scope__.latestValue).to.equal(43);
        expect(calculateFunction).to.have.been.called();
    });

    [true, false, undefined, null, function () { }, [], {}, 'test', 3.14, -2.7, 0, 1].forEach(function (aType) {
        it('should throw an error when trying to set a value of type ' + toString.call(aType) + 'to a computed', function () {
            computedModule(fakeYal);

            function tryToSetValue() {
                var computed = fakeYal.computed(function () { });

                computed(aType);
            }

            expect(tryToSetValue).to.throw(Error);
            expect(tryToSetValue).to.throw(/yal computed:/);
        });
    });

    it('should call the dispose function when calling the recalculate function', function () {
        computedModule(fakeYal, true);

        var computed = fakeYal.computed(function () { });

        computed.valueHasMutated = chai.spy();
        computed.__scope__.subscriptions = [{}];
        computed.dispose = chai.spy(computed.dispose);
        expect(computed.dispose).not.to.have.been.called();

        computed.__scope__.recalculateValue();

        expect(computed.dispose).to.have.been.called.once();
    });

    it('should call the dispose function when calling the recalculate function', function () {
        computedModule(fakeYal, true);

        var computed = fakeYal.computed(function () { });

        computed.valueHasMutated = chai.spy();
        computed.__scope__.subscriptions = [{}];
        computed.dispose = chai.spy(computed.dispose);
        fakeYal.setupDependencyDetection.reset();
        fakeYal.tierDownDependencyDetection.reset();

        computed.__scope__.recalculateValue();

        expect(fakeYal.setupDependencyDetection).to.have.been.called.once();
        expect(fakeYal.tierDownDependencyDetection).to.have.been.called.once();
    });

    it('should call valueHasMutated after recalculating the value', function () {
        computedModule(fakeYal, true);

        var computed = fakeYal.computed(function () { });

        computed.valueHasMutated = chai.spy();
        computed.__scope__.subscriptions = [{}];

        computed.__scope__.recalculateValue();

        expect(computed.valueHasMutated).to.have.been.called.once();
    });
});