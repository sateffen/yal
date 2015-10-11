'use strict';
module.exports = function (y, debug) {
    var privateSubscribableKey = Math.random().toString(26);
    
    if (debug) {
        y.privateSubscribableKey = privateSubscribableKey;
    }
    
    y.isSubscribable = function (aPotentialSubscribable) {
        return aPotentialSubscribable !== undefined &&
            aPotentialSubscribable !== null &&
            aPotentialSubscribable.__yalSubscribable__ === privateSubscribableKey &&
            typeof aPotentialSubscribable.__yalSubscribable__ === 'boolean' &&
            typeof aPotentialSubscribable.subscribe === 'function' &&
            typeof aPotentialSubscribable.unsubscribe === 'function' &&
            typeof aPotentialSubscribable.valueHasMutated === 'function';
    };

    y.extendWithSubscribable = function (aToExtend, aScope) {
        aToExtend.__yalSubscribable__ = privateSubscribableKey;

        aScope.subscriptions = [];
        aScope.dependencies = [];

        aToExtend.unsubscribe = function (aHandler) {
            aScope.subscriptions.splice(aScope.subscriptions.indexOf(aHandler), 1);
        };

        aToExtend.subscribe = function (aHandler) {
            if (typeof aHandler === 'function') {
                aScope.subscriptions.push(aHandler);

                return {
                    dispose: aToExtend.unsubscribe.bind(aToExtend, aHandler)
                };
            }
            else {
                throw new Error('yal aToExtend.subscribe: First parameter has to be a function');
            }
        };

        aToExtend.valueHasMutated = function () {
            for (var i = 0, len = aScope.subscriptions.length; i < len; i++) {
                aScope.subscriptions[i](aScope.lastestValue);
            }
        };
        
        aToExtend.dispose = function () {
            for (var i = 0, len = aScope.dependencies.length; i < len; i++) {
                aScope.dependencies[i].dispose();
            }

            aScope.dependencies = [];
        };

        return aToExtend;
    };
};