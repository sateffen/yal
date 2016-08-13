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

        scope.latestValue = aInitialValue;
        scope.setValue = function (aValue) {
            scope.latestValue = aValue;
            observable.valueHasMutated();
        };

        scope.getValue = function () {
            return scope.latestValue;
        };

        if (debug) {
            observable.__scope__ = scope;
        }

        y.extendWithSubscribable(observable, scope);
        y.extendWithExtender(observable, scope);

        return observable;
    };
};
