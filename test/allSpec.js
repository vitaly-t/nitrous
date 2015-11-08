var promise = require('../lib/index');

describe(".ALL", function () {

    describe("invalid input parameter", function () {

        it("must throw an error", function () {
            var values = [undefined, null, 0, 123, true];
            values.forEach(function (v) {
                {
                    expect(function () {
                        promise.all(v);
                    }).toThrow("You must pass an array to Promise.all().");
                }
            });
        });

    });

    describe("empty input", function () {
        var result;
        beforeEach(function (done) {
            promise.all([])
                .then(function (data) {
                    result = data;
                    done();
                });
        });
        it("must resolve with empty result", function () {
            expect(result).toEqual([]);
        });
    })

    describe("simple values input", function () {
        var result;
        beforeEach(function (done) {
            promise.all([1, 2, 3])
                .then(function (data) {
                    result = data;
                    done();
                });
        });
        it("must resolve with simple values", function () {
            expect(result).toEqual([1, 2, 3]);
        });
    })

    describe("promise values input", function () {
        var result;
        beforeEach(function (done) {
            promise.all([promise.resolve(1), promise.resolve(2), promise.resolve(3)])
                .then(function (data) {
                    result = data;
                    done();
                });
        });
        it("must resolve with the resolved values", function () {
            expect(result).toEqual([1, 2, 3]);
        });
    })
});