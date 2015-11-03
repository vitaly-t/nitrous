'use strict';

function next(func) {
    // see:
    // 1) http://stackoverflow.com/questions/15349733/setimmediate-vs-nexttick
    // 2) https://github.com/floatdrop/pinkie/blob/master/index.js#L9
    process.nextTick(func);
}

function Promise(func, st) {

    var ff, rej,
        state = st || 0; // 0=pending, >0=fulfilled, <0=rejected

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
                        func(data);// it may return a new promise;
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

Promise.resolve = function (data) {
    return new Promise(function (resolve) {
        resolve(data);
    });
};

Promise.reject = function (reason) {
    return new Promise(function (_, reject) {
        reject(reason);
    });
};

module.exports = {
    Promise: Promise
};
