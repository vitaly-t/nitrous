var promise = require('../lib/index');

function dummy() {
}

describe("CORE - negative", function () {

    describe("initialization", function () {

        describe("invalid 'this' context", function () {

            it("must throw an error", function () {
                expect(function () {
                    promise(dummy);
                }).toThrow("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
            });
        });

        describe("invalid input parameter", function () {
            function initError(param) {
                return "Promise resolver " + param + " is not a function";
            }

            it("must throw on invalid construction", function () {
                var values = [undefined, null, 0, 123, true];
                values.forEach(function (v) {
                    {
                        expect(function () {
                            new promise(v);
                        }).toThrow(initError(v));
                    }
                });
            });

        });

    });

    describe("1-level reject", function () {
        var result;
        beforeEach(function (done) {
            new promise(function (_, reject) {
                reject("failure");
            })
                .then(dummy, function (reason) {
                    result = reason;
                    done();
                });
        });

        it("must reject with the value passed", function () {
            expect(result).toBe("failure");
        });

    });

    describe("n-level reject", function () {
        var result;
        beforeEach(function (done) {
            new promise(function (_, reject) {
                reject("1");
            })
                .then(dummy, function (reason) {
                    return promise.reject(reason + "2");
                })
                .then(dummy, function (reason) {
                    return promise.reject(reason + "3");
                })
                .then(dummy, function (reason) {
                    result = reason;
                    done();
                });
        });

        it("must reject with the chain value", function () {
            expect(result).toBe("123");
        });
    });

    describe("exceptions", function () {
        var result;
        beforeEach(function (done) {
            promise.resolve("1")
                .then(function (data) {
                    throw data + "2";
                })
                .catch(function (error) {
                    return promise.resolve(error + "3");
                })
                .then(function (data) {
                    return promise.reject(data + "4");
                })
                .catch(function (error) {
                    throw error + "5";
                })
                .catch(function (error) {
                    result = error + "6";
                    done();
                });
        });
        it("must be handled everywhere", function () {
            expect(result).toBe("123456");
        });
    });

    describe("throw in constructor", function () {
        var result;
        beforeEach(function (done) {
            new promise(function () {
                throw "ops!";
            })
                .catch(function (data) {
                    result = data;
                    done();
                });
        });

        it("must reject correctly", function () {
            expect(result).toBe("ops!");
        });

    });

    describe("invalid .then", function () {
        var result;
        beforeEach(function (done) {
            var p = promise.reject("original");
            p.catch(function () {
                    return p;
                })
                .then(function () {
                    return "failed"; // this line is not to be executed;
                })
                .catch(function (error) {
                    result = error;
                    done();
                });
        });
        it("must skip .then callback", function () {
            expect(result).toBe("original");
        });
    });

});

describe("CORE - positive", function () {

    describe("1-level resolve", function () {
        var result;
        beforeEach(function (done) {
            new promise(function (resolve) {
                resolve("success");
            })
                .then(function (data) {
                    result = data;
                    done();
                });
        });

        it("must resolve with the value passed", function () {
            expect(result).toBe("success");
        });

    });

    describe("n-level resolve", function () {
        var result;
        beforeEach(function (done) {
            new promise(function (resolve) {
                resolve("1");
            })
                .then(function (data) {
                    return data + "2";
                })
                .then(function (data) {
                    return data + "3";
                })
                .then(function (data) {
                    result = data;
                    done();
                });

        });

        it("must resolve with the chained value ", function () {
            expect(result).toBe("123");
        });

    });

    describe("nesting promises", function () {
        describe("resolving", function () {
            var result;
            beforeEach(function (done) {
                promise.resolve(promise.resolve("nested"))
                    .then(function (data) {
                        result = data;
                        done();
                    });
            });
            it("must resolve with correct value", function () {
                expect(result).toBe("nested");
            });
        });
    });

    describe("deep-nesting promises", function () {
        describe("resolving", function () {
            var result;
            beforeEach(function (done) {
                promise.resolve(promise.resolve(promise.resolve(promise.resolve(promise.resolve("nested")))))
                    .then(function (data) {
                        result = data;
                        done();
                    });
            });
            it("must resolve with correct value", function () {
                expect(result).toBe("nested");
            });
        });
    });
});

describe("CORE - mixed", function () {

    describe("n-level mixed", function () {
        var result;
        beforeEach(function (done) {
            new promise(function (resolve) {
                resolve("1");
            })
                .then(function (reason) {
                    return promise.reject(reason + "2");
                })
                .then(function () {
                    throw "unexpected";
                }, function (reason) {
                    return promise.resolve(reason + "3");
                })
                .then(function (reason) {
                    result = reason;
                    done();
                }, function () {
                    throw "unexpected";
                });
        });

        it("must generate the right chain of values", function () {
            expect(result).toBe("123");
        });

    });

    describe("repeated resolve", function () {
        var result;
        beforeEach(function (done) {
            var p = promise.resolve("original");
            p.then(function () {
                    return p;
                })
                .then(function (data) {
                    result = data;
                    done();
                });
        });
        it("must resolve correctly", function () {
            expect(result).toBe("original");
        });
    });

});

describe(".CATCH", function () {

    describe("n-level errors", function () {
        var result;
        beforeEach(function (done) {
            new promise(function (_, reject) {
                throw "1";
            })
                .catch(function (error) {
                    throw error + "2";
                })
                .catch(function (error) {
                    return promise.resolve(error + "3");
                })
                .then(function (data) {
                    return promise.reject(data + "4");
                })
                .catch(function (error) {
                    result = error;
                    done();
                });
        });

        it("must all be handled", function () {
            expect(result).toBe("1234");
        });
    });

});
