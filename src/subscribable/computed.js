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
