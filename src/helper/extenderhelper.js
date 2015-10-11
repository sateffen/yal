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