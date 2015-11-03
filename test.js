var promise = require("./lib/index");

var test = new promise.Promise(function (resolve, reject) {
    reject("bye!");
    //throw "Ops!";
    //resolve("hello!");
})
    .then(function (data) {
        console.log("DATA:", data);
    }, function (reason) {
        console.log("REASON:", reason);
    });
