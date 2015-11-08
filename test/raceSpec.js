var promise = require('../lib/index');

describe(".RACE - negative", function () {

    describe("invalid input parameter", function () {

        it("must throw an error", function () {
            var values = [undefined, null, 0, 123, true];
            values.forEach(function (v) {
                {
                    expect(function () {
                        promise.race(v);
                    }).toThrow("You must pass an array to Promise.race().");
                }
            });
        });

    });

});

describe(".RACE - positive", function () {

    describe("simple values input", function () {
        var result;
        beforeEach(function (done) {
            promise.race([1, 2, 3])
                .then(function (data) {
                    result = data;
                    done();
                });
        });
        it("must resolve with the first value", function () {
            expect(result).toBe(1);
        });
    });

    describe("promise values input", function () {
        var result;
        beforeEach(function (done) {
            promise.race([promise.resolve(1), promise.resolve(2), promise.resolve(3)])
                .then(function (data) {
                    result = data;
                    done();
                });
        });
        it("must resolve with the first resolved value", function () {
            expect(result).toBe(1);
        });
    });

});

