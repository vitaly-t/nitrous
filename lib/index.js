'use strict';

function next(func) {
    process.nextTick(func);
}

function Promise(func) {

    var ff, rej,
        state = 0 // 0=pending, 1=fulfilled, -1=rejected
        //nextPromise;

    this.then = function (onFulfilled, onRejected) {
        ff = onFulfilled;
        rej = onRejected;

        //nextPromise = new Promise();
        //return nextPromise; here is to chain `.then`;
    };

    function resolve(data) {
        setState(1, ff, data);
    }

    function reject(reason) {
        setState(-1, rej, reason);
    }

    function setState(s, func, data) {
        if (!state) {
            state = s;
            if (func instanceof Function) {
                next(function () {
                    try {
                        func(data);
                    } catch (e) {
                        // must return a reject;
                    }
                });
            }
        }
    }

    if (func instanceof Function) {
        next(function () {
            try {
                func(resolve, reject);
            } catch (e) {
                reject(e);
            }
        });
    }

}

module.exports = {
    Promise: Promise
};
