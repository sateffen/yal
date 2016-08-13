/* global describe, beforeEach, afterEach, it, expect */
'use strict';

var chai = require('chai');
var subscribableHelperModule = require('../../../src/helper/subscribablehelper.js');

describe('Subscribable helper', function () {
    var fakeYal;

    beforeEach(function () {
        fakeYal = {};
    });

    it('should publish a function called "isSubscribable" with one parameter expected', function () {
        subscribableHelperModule(fakeYal);

        expect(fakeYal.isSubscribable).to.be.a('function');
        expect(fakeYal.isSubscribable.length).to.equal(1);
    });

    it('should publish a function called "extendWithSubscribable" expecting two parameters', function () {
        subscribableHelperModule(fakeYal);

        expect(fakeYal.extendWithSubscribable).to.be.a('function');
        expect(fakeYal.extendWithSubscribable.length).to.equal(2);
    });

    [3.14, -2.7, 0, 1, 'test', true, false, null, undefined, function () { }, [], {}].forEach(function (aParam) {
        it('should determine a parameter of type ' + toString.call(aParam) + ' without extending as non subscribable', function () {
            subscribableHelperModule(fakeYal);

            expect(fakeYal.isSubscribable(aParam)).to.equal(false);
        });
    });

    [[], {}, function () { }].forEach(function (aParam) {
        it('should determine a parameter of type ' + toString.call(aParam) + ' with extending as subscribable', function () {
            subscribableHelperModule(fakeYal);

            fakeYal.extendWithSubscribable(aParam, aParam);

            expect(fakeYal.isSubscribable(aParam)).to.equal(true);
        });
    });

    it('should add some needed properties to the subscribable and scope when calling "extendWithSubscribable"', function () {
        subscribableHelperModule(fakeYal, true);

        var toExtend = {};
        var scope = {};

        fakeYal.extendWithSubscribable(toExtend, scope);

        expect(Array.isArray(scope.subscriptions)).to.equal(true);
        expect(Array.isArray(scope.dependencies)).to.equal(true);

        expect(toExtend.subscribe).to.be.a('function');
        expect(toExtend.unsubscribe).to.be.a('function');
        expect(toExtend.valueHasMutated).to.be.a('function');
        expect(toExtend.dispose).to.be.a('function');
        expect(toExtend.__yalSubscribable__).to.be.a('string');
        expect(toExtend.__yalSubscribable__).to.equal(fakeYal.privateSubscribableKey);
    });

    it('should add a subscription to the subscription array calling "subscribe"', function () {
        subscribableHelperModule(fakeYal);

        var toExtend = {};
        var scope = {};
        var subscriber = chai.spy();

        fakeYal.extendWithSubscribable(toExtend, scope);

        toExtend.subscribe(subscriber);

        expect(scope.subscriptions.length).to.equal(1);
        expect(scope.subscriptions[0]).to.equal(subscriber);
    });

    it('should return a object with a dispose function when subscribing', function () {
        subscribableHelperModule(fakeYal);

        var toExtend = {};
        var scope = {};
        var subscriber = chai.spy();

        fakeYal.extendWithSubscribable(toExtend, scope);

        var returnObject = toExtend.subscribe(subscriber);

        expect(returnObject).to.be.a('object');
        expect(returnObject.dispose).to.be.a('function');
    });

    [3.14, -2.7, 0, 1, 'test', true, false, null, [], {}].forEach(function (aParam) {
        it('should throw an error calling "subscribe" with ' + toString.call(aParam), function () {
            subscribableHelperModule(fakeYal);

            var toExtend = {};
            var scope = {};

            fakeYal.extendWithSubscribable(toExtend, scope);

            function subscribe() {
                toExtend.subscribe(aParam);
            }

            expect(subscribe).to.throw();
            expect(subscribe).to.throw(/^yal aToExtend.subscribe:/);
        });
    });

    it('should remove the handler from the subscriptions calling "unsubscribe"', function () {
        subscribableHelperModule(fakeYal);

        var toExtend = {};
        var scope = {};
        var subscriber = chai.spy();

        fakeYal.extendWithSubscribable(toExtend, scope);
        toExtend.subscribe(subscriber);

        expect(scope.subscriptions.length).to.equal(1);

        toExtend.unsubscribe(subscriber);

        expect(scope.subscriptions.length).to.equal(0);
    });

    it('should remove the handler from the subscriptions calling dispose on the returned object', function () {
        subscribableHelperModule(fakeYal);

        var toExtend = {};
        var scope = {};
        var subscriber = chai.spy();

        fakeYal.extendWithSubscribable(toExtend, scope);
        var returnObject = toExtend.subscribe(subscriber);

        expect(scope.subscriptions.length).to.equal(1);

        returnObject.dispose();

        expect(scope.subscriptions.length).to.equal(0);
    });

    it('should call all subscribers with the scope.latestValue on calling "valueHasMutated"', function () {
        subscribableHelperModule(fakeYal);

        var toExtend = {};
        var scope = {
            latestValue: Math.random().toString(26)
        };
        var subscriber = chai.spy();

        fakeYal.extendWithSubscribable(toExtend, scope);
        toExtend.subscribe(subscriber);

        expect(subscriber).not.to.have.been.called();

        toExtend.valueHasMutated();

        expect(subscriber).to.have.been.called();
        expect(subscriber).to.have.been.called.with(scope.latestValue);
    });

    it('should call dispose on all dependencies and clean the array calling "dispose" on toExtend', function () {
        subscribableHelperModule(fakeYal);

        var toExtend = {};
        var scope = {};
        var disposable1 = {
            dispose: chai.spy()
        };
        var disposable2 = {
            dispose: chai.spy()
        };

        fakeYal.extendWithSubscribable(toExtend, scope);
        scope.dependencies.push(disposable1, disposable2);

        expect(disposable1.dispose).not.to.have.been.called();
        expect(disposable2.dispose).not.to.have.been.called();

        toExtend.dispose();

        expect(disposable1.dispose).to.have.been.called();
        expect(disposable2.dispose).to.have.been.called();
    });
});