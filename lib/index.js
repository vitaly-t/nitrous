'use strict';

// Initial code was based on pinkie implementation:
// https://github.com/floatdrop/pinkie

var dummy = function () {
};

var STATE = {
    pending: 0,
    settled: 1,
    fulfilled: 2,
    rejected: 3
};

var asyncSetTimer = typeof setImmediate === 'undefined' ? setTimeout : setImmediate;
var asyncQueue = [];
var asyncTimer;

function asyncFlush() {
    // run promise callbacks
    for (var i = 0; i < asyncQueue.length; i++) {
        asyncQueue[i][0](asyncQueue[i][1]);
    }

    // reset async asyncQueue
    asyncQueue.length = 0;
    asyncTimer = false;
}

function asyncCall(callback, arg) {
    asyncQueue.push([callback, arg]);

    if (!asyncTimer) {
        asyncTimer = true;
        asyncSetTimer(asyncFlush, 0);
    }
}

function invokeResolver(resolver, promise) {
    function resolvePromise(value) {
        resolve(promise, value);
    }

    function rejectPromise(reason) {
        reject(promise, reason);
    }

    try {
        resolver(resolvePromise, rejectPromise);
    } catch (e) {
        rejectPromise(e);
    }
}

function invokeCallback(subscriber) {
    var owner = subscriber.owner;
    var settled = owner._state;
    var value = owner._data;
    var callback = settled === STATE.fulfilled ? subscriber.fulfilled : subscriber.rejected;
    var promise = subscriber.then;

    if (callback instanceof Function) {
        settled = STATE.fulfilled;
        try {
            value = callback(value);
        } catch (e) {
            reject(promise, e);
        }
    }

    if (!handleThenable(promise, value)) {
        if (settled === STATE.fulfilled) {
            resolve(promise, value);
        }

        if (settled === STATE.rejected) {
            reject(promise, value);
        }
    }
}

function handleThenable(promise, value) {
    var resolved;

    try {
        if (promise === value) {
            throw new TypeError('A promises callback cannot return that same promise.');
        }

        if (value && (typeof value === 'function' || typeof value === 'object')) {
            // then should be retrieved only once
            var then = value.then;

            if (typeof then === 'function') {
                then.call(value, function (val) {
                    if (!resolved) {
                        resolved = true;

                        if (value === val) {
                            fulfill(promise, val);
                        } else {
                            resolve(promise, val);
                        }
                    }
                }, function (reason) {
                    if (!resolved) {
                        resolved = true;

                        reject(promise, reason);
                    }
                });

                return true;
            }
        }
    } catch (e) {
        if (!resolved) {
            reject(promise, e);
        }

        return true;
    }

    return false;
}

function resolve(promise, value) {
    if (promise === value || !handleThenable(promise, value)) {
        fulfill(promise, value);
    }
}

function fulfill(promise, value) {
    if (promise._state === STATE.pending) {
        promise._state = STATE.settled;
        promise._data = value;

        asyncCall(publishFulfillment, promise);
    }
}

function reject(promise, reason) {
    if (promise._state === STATE.pending) {
        promise._state = STATE.settled;
        promise._data = reason;

        asyncCall(publishRejection, promise);
    }
}

function publish(promise) {
    promise._then = promise._then.forEach(invokeCallback);
}

function publishFulfillment(promise) {
    promise._state = STATE.fulfilled;
    publish(promise);
}

function publishRejection(promise) {
    promise._state = STATE.rejected;
    publish(promise);
}

function Promise(resolver) {
    if (typeof resolver !== 'function') {
        throw new TypeError('Promise resolver ' + resolver + ' is not a function');
    }

    if (this instanceof Promise === false) {
        throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');
    }

    this._then = [];

    invokeResolver(resolver, this);
}

Promise.prototype = {
    constructor: Promise,

    _state: STATE.pending,
    _then: null,
    _data: undefined,

    then: function (onFulfillment, onRejection) {
        var subscriber = {
            owner: this,
            then: new this.constructor(dummy),
            fulfilled: onFulfillment,
            rejected: onRejection
        };

        if (this._state === STATE.fulfilled || this._state === STATE.rejected) {
            // already resolved, call callback async
            asyncCall(invokeCallback, subscriber);
        } else {
            // subscribe
            this._then.push(subscriber);
        }

        return subscriber.then;
    },
    catch: function (onRejection) {
        return this.then(null, onRejection);
    }
};

Promise.all = function (promises) {
    if (!Array.isArray(promises)) {
        throw new TypeError('You must pass an array to Promise.all().');
    }

    return new Promise(function (resolve, reject) {
        var results = [];
        var remaining = 0;

        function resolver(index) {
            remaining++;
            return function (value) {
                results[index] = value;
                if (!--remaining) {
                    resolve(results);
                }
            };
        }

        for (var i = 0, promise; i < promises.length; i++) {
            promise = promises[i];

            if (promise && promise.then instanceof Function) {
                promise.then(resolver(i), reject);
            } else {
                results[i] = promise;
            }
        }

        if (!remaining) {
            resolve(results);
        }
    });
};

Promise.race = function (promises) {
    if (!Array.isArray(promises)) {
        throw new TypeError('You must pass an array to Promise.race().');
    }

    return new Promise(function (resolve, reject) {
        for (var i = 0, promise; i < promises.length; i++) {
            promise = promises[i];

            if (promise && promise.then instanceof Function) {
                promise.then(resolve, reject);
            } else {
                resolve(promise);
            }
        }
    });
};


Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
        return value;
    }

    return new Promise(function (resolve) {
        resolve(value);
    });
};

Promise.reject = function (reason) {
    return new Promise(function (resolve, reject) {
        reject(reason);
    });
};

module.exports = Promise;
