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

        scope.latestValue = undefined;
        scope.calculateFunction = aCalculateFunction;
        scope.recalculateValue = function () {
            worker.dispose();

            y.setupDependencyDetection(worker, scope.recalculateValue);

            scope.latestValue = scope.calculateFunction();
            worker.valueHasMutated();

            scope.dependencies = y.tierDownDependencyDetection(worker);
        };
        scope.setValue = function () {
            throw new Error('yal worker: Can\'t write to computed');
        };
        scope.getValue = function () {
            return scope.latestValue;
        };

        y.extendWithSubscribable(worker, scope);
        y.extendWithExtender(worker, scope);

        if (debug) {
            worker.__scope__ = scope;
        }

        // init
        y.setupDependencyDetection(worker, scope.recalculateValue);
        scope.latestValue = scope.calculateFunction();
        scope.dependencies = y.tierDownDependencyDetection(worker);

        return worker;
    };
};
