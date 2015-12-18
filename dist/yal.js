(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.yal = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

module.exports = function (y, debug) {
    var subscriptionCreationQueue = [];
    
    // if this is in debug mode, publish the registered extenders object
    if (debug) {
        // this is the same reference, so it's the same object (no copy), so this works
        y.subscriptionCreationQueue = subscriptionCreationQueue;
    }

    y.setupDependencyDetection = function (aTarget, aCallbackFunction, aIsDeep) {
        subscriptionCreationQueue.unshift({
            target: aTarget,
            callback: aCallbackFunction,
            disposables: [],
            isDeep: !!aIsDeep
        });
    };

    y.unpack = function (aSubscribable, aNoUnwrap) {
        if (y.isSubscribable(aSubscribable)) {
            if (subscriptionCreationQueue.length > 0 && subscriptionCreationQueue[0].isDeep) {
                var subscriber = subscriptionCreationQueue[0];
                var disposable = aSubscribable.subscribe(subscriber.callback);
                
                subscriber.disposables.push(disposable);
            }

            if (!aNoUnwrap) {
                return aSubscribable();
            }
        }

        return aSubscribable;
    };

    y.unwrap = function (aSubscribable) {
        if (y.isSubscribable(aSubscribable)) {
            if (subscriptionCreationQueue.length > 0) {
                var subscriber = subscriptionCreationQueue[0];
                var disposable = aSubscribable.subscribe(subscriber.callback);
                
                subscriber.disposables.push(disposable);
            }

            return aSubscribable();
        }

        return aSubscribable;
    };

    y.tierDownDependencyDetection = function (aTarget) {
        if (subscriptionCreationQueue.length === 0) {
            throw new Error('yal tierDownDependencyDetection: There is no dependency detection active');
        }
        
        var subscriber = subscriptionCreationQueue.shift();

        if (subscriber.target !== aTarget) {
            throw new Error('yal tierDownDependencyDetection: Target for tiering down is not the same as currently tracked target.');
        }

        return subscriber.disposables;
    };
};
},{}],2:[function(require,module,exports){
'use strict';
module.exports = function (y, debug) {
    var registeredExtenders = {};
    
    // if this is in debug mode, publish the registered extenders object
    if (debug) {
        // this is the same reference, so it's the same object (no copy), so this works
        y.registeredExtenders = registeredExtenders;
    }

    y.registerExtender = function (aName, aExtenderFunction) {
        if (typeof aName !== 'string') {
            throw new TypeError('yal registerExtender: First param needs to be a string, got ' + toString.call(aName));
        }
        if (typeof aExtenderFunction !== 'function') {
            throw new TypeError('yal registerExtender: Second param needs to be a function, got ' + toString.call(aExtenderFunction));
        }
        
        registeredExtenders[aName] = aExtenderFunction;
    };

    y.extendWithExtender = function (aToExtend, aScope) {
        aToExtend.extend = function (aExtenders) {
            if (Object.prototype.toString.call(aExtenders) !== '[object Object]') {
                throw new TypeError('yal extend: Externder object needs to be an object');
            }

            var extenders = Object.keys(aExtenders);

            for (var i = 0, len = extenders.length; i < len; i++) {
                if (typeof registeredExtenders[extenders[i]] === 'function') {
                    registeredExtenders[extenders[i]](aToExtend, aScope, aExtenders[extenders[i]]);
                }
                else {
                    throw new TypeError('yal extend: There is no extender called "' + extenders[i] + '"');
                }
            }

            return aToExtend;
        };
    };
};
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
'use strict';
module.exports = function (y, debug) {
    y.computed = function (aCalculateFunction) {
        if (typeof aCalculateFunction !== 'function') {
            throw new TypeError('yal computed: First argument needs to be a function, got ' + toString.call(aCalculateFunction));
        }

        var scope = {};
        
        function computed() {
            if (arguments.length > 0) {
                scope.setValue(arguments[0]);
            }

            if (scope.isDirty) {
                scope.recalculateValue(true);
            }

            y.unpack(computed, true);
            return scope.getValue();
        }

        scope.lastestValue = undefined;
        scope.calculateFunction = aCalculateFunction;
        scope.isDirty = false;
        scope.recalculateValue = function (aForceRecalculate) {
            if (scope.subscriptions.length === 0 && !aForceRecalculate) {
                scope.isDirty = true;
                return;
            }

            computed.dispose();

            y.setupDependencyDetection(computed, scope.recalculateValue);

            scope.lastestValue = scope.calculateFunction();
            computed.valueHasMutated();

            scope.dependencies = y.tierDownDependencyDetection(computed);

            scope.isDirty = false;
        };
        scope.setValue = function () {
            throw new Error('yal computed: Can\'t write to computed');
        };
        scope.getValue = function () {
            return scope.lastestValue;
        };

        y.extendWithSubscribable(computed, scope);
        y.extendWithExtender(computed, scope);
        
        if (debug) {
            computed.__scope__ = scope;
        }
        
        // init
        y.setupDependencyDetection(computed, scope.recalculateValue);
        scope.lastestValue = scope.calculateFunction();
        scope.dependencies = y.tierDownDependencyDetection(computed);
        
        return computed;
    };
};

},{}],5:[function(require,module,exports){
'use strict';
module.exports = function (y, debug) {
    y.observable = function (aInitialValue) {
        var scope = {};
        
        function observable(aNewValue) {
            if (arguments.length > 0) {
                scope.setValue(aNewValue);
            }

            y.unpack(observable, true);
            return scope.getValue();
        }

        scope.lastestValue = aInitialValue;
        scope.setValue = function (aValue) {
            scope.lastestValue = aValue;
            observable.valueHasMutated();
        };
        
        scope.getValue = function () {
            return scope.lastestValue;
        };
        
        if (debug) {
            observable.__scope__ = scope;
        }

        y.extendWithSubscribable(observable, scope);
        y.extendWithExtender(observable, scope);

        return observable;
    };
};

},{}],6:[function(require,module,exports){
'use strict';
module.exports = function (y, debug) {
    y.worker = function (aCalculateFunction) {
        if (typeof aCalculateFunction !== 'function') {
            throw new TypeError('yal worker: First argument needs to be a function, got ' + toString.call(aCalculateFunction));
        }
        
        var scope = {};

        function worker() {
            if (arguments.length > 0) {
                scope.setValue(arguments[0]);
            }

            y.unpack(worker, true);
            return scope.getValue();
        }
        
        scope.lastestValue = undefined;
        scope.calculateFunction = aCalculateFunction;
        scope.recalculateValue = function () {
            worker.dispose();

            y.setupDependencyDetection(worker, scope.recalculateValue);

            scope.lastestValue = scope.calculateFunction();
            worker.valueHasMutated();

            scope.dependencies = y.tierDownDependencyDetection(worker);
        };
        scope.setValue = function () {
            throw new Error('yal worker: Can\'t write to computed');
        };
        scope.getValue = function () {
            return scope.lastestValue;
        };

        y.extendWithSubscribable(worker, scope);
        y.extendWithExtender(worker, scope);
        
        if (debug) {
            worker.__scope__ = scope;
        }
        
        // init
        y.setupDependencyDetection(worker, scope.recalculateValue);
        scope.lastestValue = scope.calculateFunction();
        scope.dependencies = y.tierDownDependencyDetection(worker);

        return worker;
    };
};

},{}],7:[function(require,module,exports){
'use strict';
var y = {};

require('./helper/subscribablehelper')(y);
require('./helper/dependencyhelper')(y);
require('./helper/extenderhelper')(y);

require('./subscribable/observable')(y);
require('./subscribable/computed')(y);
require('./subscribable/worker')(y);

module.exports = y;
},{"./helper/dependencyhelper":1,"./helper/extenderhelper":2,"./helper/subscribablehelper":3,"./subscribable/computed":4,"./subscribable/observable":5,"./subscribable/worker":6}]},{},[7])(7)
});