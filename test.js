var promise = require("./lib/index");

var test = new promise.Promise(function (resolve, reject) {
    resolve("hello!");
})
    .then(function (data) {
        console.log("DATA:", data);
    });
