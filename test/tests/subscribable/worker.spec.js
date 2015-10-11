/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var chai = require('chai');
var workerModule = require('../../../src/subscribable/worker.js');

describe('Worker', function () {
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
        expect(workerModule).to.be.a('function');
    });

    it('should apply a function called "observable" to the target', function () {
        expect(fakeYal.worker).to.equal(undefined);

        workerModule(fakeYal);

        expect(fakeYal.worker).be.a('function');
    });

    it('should not have called any yal functions when applying', function () {
        workerModule(fakeYal);

        expect(fakeYal.unpack).to.not.have.been.called();
        expect(fakeYal.setupDependencyDetection).to.not.have.been.called();
        expect(fakeYal.tierDownDependencyDetection).to.not.have.been.called();
        expect(fakeYal.extendWithExtender).to.not.have.been.called();
        expect(fakeYal.extendWithSubscribable).to.not.have.been.called();
    });

    [true, false, null, undefined, 3.14, -2.7, 0, 1, 'test', {}, []].forEach(function (aType) {
        it('should throw an "yal worker" error initializing a worker with a value of type ' + toString.call(aType), function () {
            workerModule(fakeYal);

            function createWorker() {
                fakeYal.worker(aType);
            }

            expect(createWorker).to.throw(TypeError);
            expect(createWorker).to.throw(/yal worker:/);
        });
    });

    it('should not throw an "yal worker" error initializing a worker with a function as argument', function () {
        workerModule(fakeYal);

        function createWorker() {
            fakeYal.worker(function () { });
        }

        expect(createWorker).not.to.throw();
    });

    it('should call calculate an initial value when creating a worker', function () {
        workerModule(fakeYal);

        var calculateFunction = chai.spy();

        fakeYal.worker(calculateFunction);

        expect(calculateFunction).to.have.been.called();
    });

    it('should return the initially calculated value after creating a worker', function () {
        workerModule(fakeYal);

        var calculatedValue = Math.random().toString(26);

        function calculateFunction() {
            return calculatedValue;
        }

        var worker = fakeYal.worker(calculateFunction);

        expect(worker()).to.equal(calculatedValue);
    });

    it('should call the setup and tierdown function for dependency management on creation of worker', function () {
        workerModule(fakeYal);

        fakeYal.worker(function () { });

        expect(fakeYal.setupDependencyDetection).to.have.been.called();
        expect(fakeYal.tierDownDependencyDetection).to.have.been.called();
    });

    it('should call the setup dependency management function on creation of worker with the correct arguments', function () {
        workerModule(fakeYal, true);

        var worker = fakeYal.worker(function () { });

        expect(fakeYal.setupDependencyDetection).to.have.been.called.with(worker, worker.__scope__.recalculateValue);
    });

    it('should call the tierdown dependency management function on creation of worker with the correct arguments', function () {
        workerModule(fakeYal);

        var worker = fakeYal.worker(function () { });

        expect(fakeYal.tierDownDependencyDetection).to.have.been.called.with(worker);
    });

    it('should save the dependencies returned by the tierDownDependencyDetection function', function () {
        var returnValue = Math.random().toString(26);

        fakeYal.tierDownDependencyDetection = chai.spy(function () {
            return [returnValue];
        });

        workerModule(fakeYal, true);

        var worker = fakeYal.worker(function () { });

        expect(worker.__scope__.dependencies.length).to.equal(1);
        expect(worker.__scope__.dependencies[0]).to.equal(returnValue);
    });

    it('should call the y.extendWithExtender function whenever a worker is created, with the workers and it\'s inner scope as arguments', function () {
        workerModule(fakeYal, true);
        expect(fakeYal.extendWithExtender).to.not.have.been.called();

        var worker = fakeYal.worker(function () { });

        expect(fakeYal.extendWithExtender).to.have.been.called.once();

        var callArgs = fakeYal.extendWithSubscribable.__spy.calls[0];

        expect(callArgs[0]).to.equal(worker);
        expect(callArgs[1]).to.equal(worker.__scope__);
    });

    it('should call the y.extendWithSubscribable function whenever a worker is created, with the worker and it\'s inner scope as arguments', function () {
        workerModule(fakeYal, true);
        expect(fakeYal.extendWithSubscribable).to.not.have.been.called();

        var worker = fakeYal.worker(function () { });

        expect(fakeYal.extendWithSubscribable).to.have.been.called.once();

        var callArgs = fakeYal.extendWithSubscribable.__spy.calls[0];

        expect(callArgs[0]).to.equal(worker);
        expect(callArgs[1]).to.equal(worker.__scope__);
    });

    [true, false, undefined, null, function () { }, [], {}, 'test', 3.14, -2.7, 0, 1].forEach(function (aType) {
        it('should throw an error when trying to set a value of type ' + toString.call(aType) + 'to a worker', function () {
            workerModule(fakeYal);

            function tryToSetValue() {
                var worker = fakeYal.worker(function () { });
                
                worker(aType);
            }

            expect(tryToSetValue).to.throw(Error);
            expect(tryToSetValue).to.throw(/yal worker:/);
        });
    });
    
    it('should call the dispose function when calling the recalculate function', function () {
        workerModule(fakeYal, true);
        
        var worker = fakeYal.worker(function () { });
        
        worker.valueHasMutated = chai.spy();
        worker.dispose = chai.spy(worker.dispose);
        expect(worker.dispose).not.to.have.been.called();
        
        worker.__scope__.recalculateValue();
        
        expect(worker.dispose).to.have.been.called.once();
    });
    
    it('should call the dispose function when calling the recalculate function', function () {
        workerModule(fakeYal, true);
        
        var worker = fakeYal.worker(function () { });
        
        worker.valueHasMutated = chai.spy();
        worker.dispose = chai.spy(worker.dispose);
        fakeYal.setupDependencyDetection.reset();
        fakeYal.tierDownDependencyDetection.reset();
        
        worker.__scope__.recalculateValue();
        
        expect(fakeYal.setupDependencyDetection).to.have.been.called.once();
        expect(fakeYal.tierDownDependencyDetection).to.have.been.called.once();
    });
    
    it('should call valueHasMutated after recalculating the value', function () {
        workerModule(fakeYal, true);
        
        var worker = fakeYal.worker(function () { });
        
        worker.valueHasMutated = chai.spy();
        
        worker.__scope__.recalculateValue();
        
        expect(worker.valueHasMutated).to.have.been.called.once();
    });
});