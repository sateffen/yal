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